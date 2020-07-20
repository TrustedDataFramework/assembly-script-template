package org.tds.cmd;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
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
import org.tdf.common.util.HexBytes;
import org.tdf.sunflower.types.Transaction;

import static org.tds.cmd.Main.OBJECT_MAPPER;

@RequiredArgsConstructor
public class HttpUtil {
    @NonNull
    private final String host;
    private final int port;
    private HttpClient client = HttpClientBuilder.create().build();

    @SneakyThrows
    public long getLatestNonce(HexBytes address) {
        String getUrl = "http://" + host + ":" + port + "/rpc/account/" + address.toHex();
        HttpGet get = new HttpGet(getUrl);
        HttpResponse getResponse = client.execute(get);
        if (getResponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            String data = EntityUtils.toString(getResponse.getEntity(), Charsets.UTF_8);
            JsonNode n = OBJECT_MAPPER.readValue(data, JsonNode.class);
            return n.get("data").get("nonce").asLong();
        }
        throw new RuntimeException("get nonce failed http error " + getResponse.getStatusLine().getStatusCode());
    }


    @SneakyThrows
    public String sendTransaction(Transaction tx) {
        String postUrl = "http://" + host + ":" + port + "/rpc/transaction";
        HttpPost post = new HttpPost(postUrl);
        HttpEntity entity = new StringEntity(OBJECT_MAPPER.writeValueAsString(tx), ContentType.APPLICATION_JSON);
        post.setEntity(entity);
        HttpResponse postResponse = client.execute(post);
        if (postResponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            HttpEntity resEntity = postResponse.getEntity();
            return EntityUtils.toString(resEntity);
        }
        throw new RuntimeException("send transaction failed http error " + postResponse.getStatusLine().getStatusCode());
    }
}
