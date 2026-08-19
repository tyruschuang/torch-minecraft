package structs

type ProbeDiagnostic struct {
	Edition      string `json:"edition"`
	Reachable    bool   `json:"reachable"`
	Host         string `json:"host"`
	Port         uint16 `json:"port"`
	ResolvedHost string `json:"resolved_host,omitempty"`
	ResolvedPort uint16 `json:"resolved_port,omitempty"`
	Version      string `json:"version,omitempty"`
	Protocol     int    `json:"protocol,omitempty"`
	Latency      *int64 `json:"latency,omitempty"`
	ErrorCode    string `json:"error_code,omitempty"`
	ErrorMessage string `json:"error_message,omitempty"`
}

type ConnectionDiagnostics struct {
	RequestedHost string          `json:"requested_host"`
	DNSAddresses  []string        `json:"dns_addresses"`
	DNSError      string          `json:"dns_error,omitempty"`
	Java          ProbeDiagnostic `json:"java"`
	Bedrock       ProbeDiagnostic `json:"bedrock"`
}

type AutoStatusResponse struct {
	Edition     string                `json:"edition,omitempty"`
	Status      interface{}           `json:"status"`
	Diagnostics ConnectionDiagnostics `json:"diagnostics"`
}
