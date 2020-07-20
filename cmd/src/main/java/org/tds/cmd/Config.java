package org.tds.cmd;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Config {
    private long version;
    private String host;
    private int port;
    private String source;

    @JsonProperty("private-key")
    private String privateKey;

    @JsonProperty("asc-path")
    private String ascPath;
}
