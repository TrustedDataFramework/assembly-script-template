package org.tds.cmd;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.tika.io.IOUtils;

import java.io.InputStream;

@RequiredArgsConstructor
public class AscWrapper {
    @NonNull
    private final String ascPath;

    @SneakyThrows
    public byte[] compile(@NonNull String source) {
        String cmd = ascPath + " " + source + " --optimize -b";
        Process p = Runtime.getRuntime().exec(cmd);
        InputStream in = p.getInputStream();
        return IOUtils.toByteArray(in);
    }
}
