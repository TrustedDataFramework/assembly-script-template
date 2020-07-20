package org.tds.cmd;


import com.beust.jcommander.Parameter;
import com.beust.jcommander.Parameters;
import lombok.SneakyThrows;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;

@Parameters(commandDescription = "compile source file to wasm binary")
public class Compile {
    @Parameter(names = {"--source", "-s"}, description = "wasm contract source file")
    private String source;

    @Parameter(names = {"--output", "-p"}, description = "target file")
    private String output;

    @Parameter(names = {"--ascPath", "-a"}, description = "asc file path, often located in node_modules/.bin/")
    private String ascPath;

    private String beforeExtension(String file) {
        if (file.isEmpty())
            return file;
        char[] chars = file.toCharArray();
        int i = -1;
        for (int j = 0; j < chars.length; j++) {
            if (chars[j] == '.') i = j;
        }
        if (i < 0)
            return file;
        return new String(Arrays.copyOfRange(chars, 0, i));
    }

    public void withDefault() {
        if (ascPath == null || ascPath.isEmpty())
            ascPath = "node_modules/.bin/asc";
        if (output == null || output.isEmpty()) {
            output = beforeExtension(source) + ".wasm";
        }
    }

    @SneakyThrows
    public void run() {
        withDefault();
        AscWrapper wrapper = new AscWrapper(ascPath);
        Files.write(Paths.get(output), wrapper.compile(source), StandardOpenOption.WRITE, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }
}
