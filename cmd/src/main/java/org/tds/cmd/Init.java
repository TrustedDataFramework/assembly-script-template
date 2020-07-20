package org.tds.cmd;

import com.beust.jcommander.Parameter;
import com.beust.jcommander.Parameters;
import lombok.SneakyThrows;
import org.apache.tika.io.IOUtils;

@Parameters(commandDescription = "init ")
public class Init {
    private static final String url = "https://github.com/TrustedDataFramework/assembly-script-template";

    @Parameter
    private String dir = "";

    @SneakyThrows
    public void run(){
        System.out.println(this.dir);
        Process p = Runtime.getRuntime().exec("git clone " + url + " " + dir);
        IOUtils.copy(p.getInputStream(), System.out);
        IOUtils.copy(p.getErrorStream(), System.err);
    }
}
