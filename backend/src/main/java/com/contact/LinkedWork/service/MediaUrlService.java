package com.contact.LinkedWork.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service("MediaUrlService")
@Transactional
public class MediaUrlService {

    @Value("${linkedwork.api.public-url:http://localhost:8082/LinkedApi}")
    private String apiPublicUrl;

    public String toPublicUrl(String filename) {
        if (filename == null || filename.isBlank()) {
            return null;
        }
        if (filename.startsWith("http://") || filename.startsWith("https://")) {
            return filename;
        }
        return apiPublicUrl.replaceAll("/$", "") + "/uploads/" + filename.trim();
    }
}
