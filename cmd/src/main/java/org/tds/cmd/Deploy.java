package org.tds.cmd;

import com.beust.jcommander.Parameter;
import com.beust.jcommander.Parameters;
import lombok.SneakyThrows;
import org.tdf.common.util.HexBytes;
import org.tdf.sunflower.consensus.poa.PoAConstants;
import org.tdf.sunflower.state.Address;
import org.tdf.sunflower.types.CryptoContext;
import org.tdf.sunflower.types.Transaction;

import java.io.File;

import static org.tds.cmd.Main.OBJECT_MAPPER;

@Parameters(commandDescription = "compile and deploy contract to tds server")
public class Deploy {
    @Parameter(names = {"--source", "-s"}, description = "wasm contract source file")
    private String source;
    @Parameter(names = {"--privateKey", "-k"}, description = "your tds private key")
    private String privateKey;
    @Parameter(names = {"--ascPath", "-a"}, description = "asc file path, often located in node_modules/.bin/")
    private String ascPath;
    @Parameter(names = {"--host", "-h"}, description = "tds server host")
    private String host;
    @Parameter(names = {"--port", "-p"}, description = "tds server port")
    private int port;

    @Parameter(names = {"--config", "-c"}, description = "deploy configuration file, overrided by command line options")
    private String config;

    private void setConfig(Config config) {
        if (this.source == null || this.source.isEmpty())
            this.source = config.getSource();

        if (this.privateKey == null || this.privateKey.isEmpty())
            this.privateKey = config.getPrivateKey();

        if (this.ascPath == null || this.ascPath.isEmpty())
            this.ascPath = config.getAscPath();

        if (this.host == null || this.host.isEmpty())
            this.host = config.getHost();

        if (this.port == 0)
            this.port = config.getPort();
    }

    @SneakyThrows
    private void loadJsonConfig() {
        if (config != null && !config.isEmpty()) {
            File f = new File(config);
            if (f.exists() && !f.isDirectory()) {
                Config c = OBJECT_MAPPER.readValue(f, Config.class);
                setConfig(c);
            }
        }
    }

    @SneakyThrows
    public void run() {
        loadJsonConfig();
        HexBytes publicKey = HexBytes.fromBytes(CryptoContext.getPkFromSk(HexBytes.decode(privateKey)));
        HttpUtil util = new HttpUtil(host, port);
        AscWrapper wrapper = new AscWrapper(ascPath);
        HexBytes address = Address.fromPublicKey(publicKey);
        Transaction tx = new Transaction(
                PoAConstants.TRANSACTION_VERSION,
                Transaction.Type.CONTRACT_DEPLOY.code,
                System.currentTimeMillis() / 1000,
                util.getLatestNonce(address) + 1,
                publicKey,
                0, 0,
                HexBytes.EMPTY,
                HexBytes.EMPTY,
                HexBytes.EMPTY
        );

        tx.setPayload(HexBytes.fromBytes(wrapper.compile(source)));
        byte[] sig = CryptoContext.sign(HexBytes.fromHex(privateKey).getBytes(), tx.getSignaturePlain());
        tx.setSignature(HexBytes.fromBytes(sig));
        System.out.println("deploy contract " + source + " address = " + tx.createContractAddress());
        System.out.println("tds server response: \n" + util.sendTransaction(tx));
    }
}
