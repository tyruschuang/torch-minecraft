package endpoints

import "testing"

func TestParseProbeAddressUsesEditionDefaults(t *testing.T) {
	host, javaPort, bedrockPort, err := parseProbeAddress("example.com")
	if err != nil {
		t.Fatal(err)
	}
	if host != "example.com" || javaPort != 25565 || bedrockPort != 19132 {
		t.Fatalf("unexpected parsed address: %s %d %d", host, javaPort, bedrockPort)
	}
}

func TestParseProbeAddressUsesExplicitPortForBothEditions(t *testing.T) {
	host, javaPort, bedrockPort, err := parseProbeAddress("example.com:25570")
	if err != nil {
		t.Fatal(err)
	}
	if host != "example.com" || javaPort != 25570 || bedrockPort != 25570 {
		t.Fatalf("unexpected parsed address: %s %d %d", host, javaPort, bedrockPort)
	}
}

func TestParseProbeAddressSupportsIPv6(t *testing.T) {
	host, javaPort, bedrockPort, err := parseProbeAddress("[2001:db8::1]:25570")
	if err != nil {
		t.Fatal(err)
	}
	if host != "2001:db8::1" || javaPort != 25570 || bedrockPort != 25570 {
		t.Fatalf("unexpected parsed address: %s %d %d", host, javaPort, bedrockPort)
	}
}

func TestParseProbeAddressRejectsInvalidPort(t *testing.T) {
	if _, _, _, err := parseProbeAddress("example.com:70000"); err == nil {
		t.Fatal("expected invalid port to be rejected")
	}
}
