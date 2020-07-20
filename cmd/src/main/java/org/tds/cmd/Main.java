package org.tds.cmd;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.Charsets;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.tika.io.IOUtils;
import org.tdf.common.util.HexBytes;
import org.tdf.crypto.CryptoHelpers;
import org.tdf.crypto.sm2.SM2;
import org.tdf.crypto.sm2.SM2PrivateKey;
import org.tdf.crypto.sm2.SM2PublicKey;
import org.tdf.gmhelper.SM2Util;
import org.tdf.gmhelper.SM3Util;
import org.tdf.sunflower.consensus.poa.PoAConstants;
import org.tdf.sunflower.state.Address;
import org.tdf.sunflower.types.CryptoContext;
import org.tdf.sunflower.types.Transaction;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;


public class Main {
    static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Parameter(names = {"--source", "-s"})
    private String source;
    @Parameter(names = {"--privateKey", "-k"})
    private String privateKey;
    @Parameter(names = {"--ascPath", "-a"})
    private String ascPath;
    @Parameter(names = {"--host", "-h"})
    private String host;
    @Parameter(names = {"--port", "-p"})
    private int port;

    @Parameter(names = {"--config", "-c"})
    private String config;


    public void setConfig(Config config) {
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

    public static void initCryptoContext() {
        CryptoContext.setSignatureVerifier((pk, msg, sig) -> new SM2PublicKey(pk).verify(msg, sig));
        CryptoContext.setSigner((sk, msg) -> new SM2PrivateKey(sk).sign(msg));
        CryptoContext.setSecretKeyGenerator(() -> SM2.generateKeyPair().getPrivateKey().getEncoded());
        CryptoContext.setGetPkFromSk((sk) -> new SM2PrivateKey(sk).generatePublicKey().getEncoded());
        CryptoContext.setEcdh((initiator, sk, pk) -> SM2.calculateShareKey(initiator, sk, sk, pk, pk, SM2Util.WITH_ID));
        CryptoContext.setEncrypt(CryptoHelpers.ENCRYPT);
        CryptoContext.setDecrypt(CryptoHelpers.DECRYPT);
        CryptoContext.setPublicKeySize(CryptoContext.getPkFromSk(CryptoContext.generateSecretKey()).length);
        CryptoContext.setHashFunction(SM3Util::hash);
    }

    public static void main(String... args) throws IOException {
        System.out.println(PoAConstants.TRANSACTION_VERSION);
        initCryptoContext();
        Main m = new Main();
        JCommander.newBuilder()
                .addObject(m)
                .build()
                .parse(args);

        if(m.config != null && !m.config.isEmpty()){
            File f = new File(m.config);
            if(f.exists() && !f.isDirectory()){
                Config c = OBJECT_MAPPER.readValue(f, Config.class);
                m.setConfig(c);
            }
        }
        m.run();
    }

    public void run() throws IOException {
        HexBytes publicKey = HexBytes.fromBytes(CryptoContext.getPkFromSk(HexBytes.decode(privateKey)));
        ;
        HexBytes address = Address.fromPublicKey(publicKey);
        long nonce = 0L;
        String getUrl = "http://" + host + ":" + port + "/rpc/account/" + address.toHex();
        HttpClient client = HttpClientBuilder.create().build();
        HttpGet get = new HttpGet(getUrl);
        HttpResponse getResponse = client.execute(get);
        if (getResponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            String data = EntityUtils.toString(getResponse.getEntity(), Charsets.UTF_8);
            JsonNode n = OBJECT_MAPPER.readValue(data, JsonNode.class);
            nonce = n.get("data").get("nonce").asLong() + 1;
        }
        Transaction tx = new Transaction(
                PoAConstants.TRANSACTION_VERSION,
                Transaction.Type.CONTRACT_DEPLOY.code,
                System.currentTimeMillis() / 1000,
                nonce,
                publicKey,
                0, 0,
                HexBytes.EMPTY,
                HexBytes.EMPTY,
                HexBytes.EMPTY
        );
        String cmd = ascPath + " " + source + " --optimize -b";
        Process p = Runtime.getRuntime().exec(cmd);
        InputStream in = p.getInputStream();
        byte[] payload = IOUtils.toByteArray(in);
        tx.setPayload(HexBytes.fromBytes(payload));
        byte[] sig = CryptoContext.sign(HexBytes.fromHex(privateKey).getBytes(), tx.getSignaturePlain());
        tx.setSignature(HexBytes.fromBytes(sig));
        System.out.println("deploy contract " + source + " address = " + tx.createContractAddress());
        String postUrl = "http://" + host + ":" + port + "/rpc/transaction";
        HttpPost post = new HttpPost(postUrl);
        HttpEntity entity = new StringEntity(OBJECT_MAPPER.writeValueAsString(tx), ContentType.APPLICATION_JSON);
        post.setEntity(entity);
        HttpResponse postResponse = client.execute(post);
        if (postResponse.getStatusLine().getStatusCode() == 200) {
            HttpEntity resEntity = postResponse.getEntity();
            String data = EntityUtils.toString(resEntity);
            System.out.println(data);
        }
    }
}
