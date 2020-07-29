package org.tds.cmd;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.tika.io.IOUtils;

import java.io.InputStream;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
public class AscWrapper {
    @NonNull
    private final String ascPath;

    @SneakyThrows
    public byte[] compile(@NonNull String source) {
        String cmd = ascPath + " " + source + " --optimize -b";
        Process p = Runtime.getRuntime().exec(cmd);
        InputStream in = p.getInputStream();
        Future<byte[]> errorFuture =
                CompletableFuture.supplyAsync(() -> {
                    try{
                        return IOUtils.toByteArray(p.getErrorStream());
                    }catch (Exception e){
                        e.printStackTrace();
                        return new byte[0];
                    }
                });

        byte[] error = new byte[0];
        try{
            error = errorFuture.get(3, TimeUnit.SECONDS);
        }catch (Exception ignored){}
        if(error != null && error.length > 0){
            throw new RuntimeException(new String(error));
        }
        return IOUtils.toByteArray(in);
    }
}
