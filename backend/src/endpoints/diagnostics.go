package endpoints

import (
	"errors"
	"fmt"
	"net"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"torch/src/structs"

	"github.com/gin-gonic/gin"
)

type inspectionResult struct {
	host        string
	javaPort    uint16
	bedrockPort uint16
	java        *structs.JavaStatus
	bedrock     *structs.BedrockStatus
	diagnostics structs.ConnectionDiagnostics
}

func AutoStatusHandler(c *gin.Context) {
	result, err := inspectServer(c.Param("ip"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	response := structs.AutoStatusResponse{Diagnostics: result.diagnostics}
	switch {
	case result.java != nil:
		response.Edition = "java"
		response.Status = result.java
	case result.bedrock != nil:
		response.Edition = "bedrock"
		response.Status = result.bedrock
	default:
		response.Status = structs.OfflineServer{
			Offline: true,
			Host:    result.host,
			Port:    result.javaPort,
		}
	}

	c.JSON(200, response)
}

func DiagnosticsHandler(c *gin.Context) {
	result, err := inspectServer(c.Param("ip"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, result.diagnostics)
}

func inspectServer(address string) (inspectionResult, error) {
	host, javaPort, bedrockPort, err := parseProbeAddress(address)
	if err != nil {
		return inspectionResult{}, err
	}

	var javaStatus *structs.JavaStatus
	var bedrockStatus *structs.BedrockStatus
	var javaErr error
	var bedrockErr error
	var addresses []net.IP
	var dnsErr error

	var waitGroup sync.WaitGroup
	waitGroup.Add(3)
	go func() {
		defer waitGroup.Done()
		javaStatus, javaErr = getJavaStatus(host, javaPort)
	}()
	go func() {
		defer waitGroup.Done()
		bedrockStatus, bedrockErr = getBedrockStatus(host, bedrockPort)
	}()
	go func() {
		defer waitGroup.Done()
		addresses, dnsErr = net.LookupIP(host)
	}()
	waitGroup.Wait()

	dnsAddresses := make([]string, 0, len(addresses))
	for _, address := range addresses {
		dnsAddresses = append(dnsAddresses, address.String())
	}
	sort.Strings(dnsAddresses)

	diagnostics := structs.ConnectionDiagnostics{
		RequestedHost: host,
		DNSAddresses:  dnsAddresses,
		Java:          javaDiagnostic(host, javaPort, javaStatus, javaErr),
		Bedrock:       bedrockDiagnostic(host, bedrockPort, bedrockStatus, bedrockErr),
	}
	if dnsErr != nil {
		diagnostics.DNSError = "DNS lookup failed."
	}

	return inspectionResult{
		host:        host,
		javaPort:    javaPort,
		bedrockPort: bedrockPort,
		java:        javaStatus,
		bedrock:     bedrockStatus,
		diagnostics: diagnostics,
	}, nil
}

func getJavaStatus(host string, port uint16) (*structs.JavaStatus, error) {
	cacheKey := fmt.Sprintf("%s:%d", host, port)
	if data, err := javaCache.Value(cacheKey); err == nil {
		return data.Data().(*structs.JavaStatus), nil
	}

	status, err := FetchJava(host, port)
	if err == nil {
		javaCache.Add(cacheKey, statusCacheTime, status)
	}
	return status, err
}

func getBedrockStatus(host string, port uint16) (*structs.BedrockStatus, error) {
	cacheKey := fmt.Sprintf("%s:%d", host, port)
	if data, err := bedrockCache.Value(cacheKey); err == nil {
		return data.Data().(*structs.BedrockStatus), nil
	}

	status, err := fetchBedrock(host, port)
	if err == nil {
		bedrockCache.Add(cacheKey, statusCacheTime, status)
	}
	return status, err
}

func javaDiagnostic(host string, port uint16, status *structs.JavaStatus, err error) structs.ProbeDiagnostic {
	diagnostic := baseDiagnostic("java", host, port, err)
	if status == nil {
		return diagnostic
	}

	diagnostic.Reachable = true
	diagnostic.Version = status.Version.Name.Clean
	diagnostic.Protocol = status.Version.Protocol
	if status.Latency >= 0 {
		latency := int64(status.Latency)
		diagnostic.Latency = &latency
	}
	if status.SrvRecord != nil {
		diagnostic.ResolvedHost = strings.TrimSuffix(status.SrvRecord.Host, ".")
		diagnostic.ResolvedPort = status.SrvRecord.Port
	}
	return diagnostic
}

func bedrockDiagnostic(host string, port uint16, status *structs.BedrockStatus, err error) structs.ProbeDiagnostic {
	diagnostic := baseDiagnostic("bedrock", host, port, err)
	if status == nil {
		return diagnostic
	}

	diagnostic.Reachable = true
	diagnostic.Version = status.Version.Name.Clean
	diagnostic.Protocol = status.Version.Protocol
	latency := int64(status.Latency)
	diagnostic.Latency = &latency
	return diagnostic
}

func baseDiagnostic(edition string, host string, port uint16, err error) structs.ProbeDiagnostic {
	diagnostic := structs.ProbeDiagnostic{
		Edition: edition,
		Host:    host,
		Port:    port,
	}
	if err == nil {
		return diagnostic
	}

	diagnostic.ErrorCode, diagnostic.ErrorMessage = diagnosticError(err)
	return diagnostic
}

func diagnosticError(err error) (string, string) {
	var dnsError *net.DNSError
	var networkError net.Error

	switch {
	case errors.As(err, &dnsError):
		return "dns", "The hostname did not resolve. Check its spelling and DNS records."
	case errors.As(err, &networkError) && networkError.Timeout():
		return "timeout", "No response arrived before the timeout. Check the edition, port, and firewall."
	case errors.Is(err, syscall.ECONNREFUSED):
		return "refused", "The host refused this connection. Confirm that the server is running on this port."
	case strings.Contains(strings.ToLower(err.Error()), "unexpected"),
		strings.Contains(strings.ToLower(err.Error()), "invalid"):
		return "protocol", "The server replied, but its status response was not valid for this edition."
	default:
		return "unreachable", "Torch could not reach this address. Check the hostname, port, and network rules."
	}
}

func parseProbeAddress(value string) (string, uint16, uint16, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", 0, 0, fmt.Errorf("server address is required")
	}

	if host, portValue, err := net.SplitHostPort(value); err == nil {
		port, err := parsePort(portValue)
		return host, port, port, err
	}

	if strings.Count(value, ":") == 1 {
		host, portValue, _ := strings.Cut(value, ":")
		port, err := parsePort(portValue)
		if err != nil {
			return "", 0, 0, err
		}
		if host == "" {
			return "", 0, 0, fmt.Errorf("server hostname is required")
		}
		return host, port, port, nil
	}

	return strings.Trim(value, "[]"), 25565, 19132, nil
}

func parsePort(value string) (uint16, error) {
	port, err := strconv.Atoi(value)
	if err != nil || port < 1 || port > 65535 {
		return 0, fmt.Errorf("port must be between 1 and 65535")
	}
	return uint16(port), nil
}
