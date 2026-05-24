package com.contact.LinkedWork.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;

@Service("SupabaseStorageService")
public class SupabaseStorageService {
     @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final WebClient webClient = WebClient.builder().build();

    public String uploadFile(MultipartFile file) throws IOException {

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        webClient.put()
                .uri(supabaseUrl + "/storage/v1/object/" + bucket + "/" + filename)
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .bodyValue(file.getBytes())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + filename;
    }

}
