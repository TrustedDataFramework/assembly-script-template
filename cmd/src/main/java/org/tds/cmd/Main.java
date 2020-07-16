package org.tds.cmd;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.tika.io.IOUtils;
import org.tdf.common.util.HexBytes;
import org.tdf.crypto.CryptoHelpers;
import org.tdf.crypto.sm2.SM2;
import org.tdf.crypto.sm2.SM2PrivateKey;
import org.tdf.crypto.sm2.SM2PublicKey;
import org.tdf.gmhelper.SM2Util;
import org.tdf.gmhelper.SM3Util;
import org.tdf.sunflower.state.Address;
import org.tdf.sunflower.types.CryptoContext;
import org.tdf.sunflower.types.Transaction;
import org.tds.cmd.util.ASCWrapper;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.commons.codec.Charsets;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.util.EntityUtils;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;


public class Main {
    @Parameter(names={"--version", "-v"})
    private int version;
    @Parameter(names={"--entryPoint", "-e"})
    private int entryPoint;
    @Parameter(names={"--source", "-s"})
    private String source;
    @Parameter(names={"--privateKey", "-p"})
    private String privateKey;
    @Parameter(names={"--ascPath", "-a"})
    private String ascPath;
    @Parameter(names = "-host")
    private String host;
    @Parameter(names = "-port")
    private String port;

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

    public static void main(String ... args) throws IOException, InterruptedException {
        initCryptoContext();
        Main m = new Main();
        JCommander.newBuilder()
                .addObject(m)
                .build()
                .parse(args);
        m.run();
    }

    public void run() throws IOException, InterruptedException {
        ObjectMapper objectMapper= new ObjectMapper();
        HexBytes publicKey = HexBytes.fromBytes(CryptoContext.getPkFromSk(HexBytes.decode(privateKey)));;
        System.out.println(publicKey.toHex());
        HexBytes address = Address.fromPublicKey(publicKey);
        long nonce = 0L;
        String getUrl = "http://" + host + ":" + port + "/rpc/account/" + address.toHex();
        HttpClient client = HttpClientBuilder.create().build();
        HttpGet get = new HttpGet(getUrl);
        HttpResponse getResponse = client.execute(get);
        if (getResponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            String data = EntityUtils.toString(getResponse.getEntity(),Charsets.UTF_8);
            JsonNode n = objectMapper.readValue(data, JsonNode.class);
            nonce = n.get("data").get("nonce").asLong() + 1;
        }
        System.out.println(nonce);
        Transaction tx = new Transaction(
                version,
                entryPoint,
                System.currentTimeMillis() / 1000,
                nonce,
                publicKey,
                0, 0,
                HexBytes.EMPTY,
                HexBytes.EMPTY,
                HexBytes.EMPTY
        );
        String cmd = ascPath + " " + source +  " --optimize -b";
        System.out.println(cmd);
        Process p = Runtime.getRuntime().exec("cmd /c " + cmd);
        p.waitFor();
        byte[] error = IOUtils.toByteArray(p.getErrorStream());
        if(error != null && error.length > 0){
            throw new RuntimeException(new String(error));
        }
        byte[] payload = IOUtils.toByteArray(p.getInputStream());
        tx.setPayload(HexBytes.fromBytes(payload));
        byte[] sig = CryptoContext.sign(privateKey.getBytes(), tx.getSignaturePlain());
        tx.setSignature(HexBytes.fromBytes(sig));
        String postUrl = "http://" + host + ":" + port + "/rpc/transaction";
        HttpPost post = new HttpPost(postUrl);
        HttpEntity entity = new StringEntity(objectMapper.writeValueAsString(tx), ContentType.APPLICATION_JSON);
        post.setEntity(entity);
        HttpResponse postResponse = client.execute(post);
        if (postResponse.getStatusLine().getStatusCode() == 200) {
            HttpEntity resEntity = postResponse.getEntity();
            String data = EntityUtils.toString(resEntity);
            System.out.println(data);
        }
    }
}
