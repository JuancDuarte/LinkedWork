package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.dto.JobOfferDTO;
import com.contact.LinkedWork.service.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/job-offers")
public class JobOfferController {
    
    @Autowired
    private JobOfferService jobOfferService;
    
    /**
     * Create a new job offer
     * POST /LinkedApi/job-offers
     */
    @PostMapping
    public ResponseEntity<JobOfferDTO> createJobOffer(@RequestBody JobOfferDTO jobOfferDTO) {
        JobOfferDTO createdJobOffer = jobOfferService.createJobOffer(jobOfferDTO);
        return new ResponseEntity<>(createdJobOffer, HttpStatus.CREATED);
    }
    
    /**
     * Get all active job offers
     * GET /LinkedApi/job-offers
     */
    @GetMapping
    public ResponseEntity<List<JobOfferDTO>> getAllJobOffers() {
        List<JobOfferDTO> jobOffers = jobOfferService.getAllJobOffers();
        return new ResponseEntity<>(jobOffers, HttpStatus.OK);
    }
    
    /**
     * Get job offer by ID
     * GET /LinkedApi/job-offers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDTO> getJobOfferById(@PathVariable Long id) {
        Optional<JobOfferDTO> jobOffer = jobOfferService.getJobOfferById(id);
        return jobOffer.map(jo -> new ResponseEntity<>(jo, HttpStatus.OK))
                       .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    /**
     * Get all job offers by user ID
     * GET /LinkedApi/job-offers/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobOfferDTO>> getJobOffersByUserId(@PathVariable Long userId) {
        List<JobOfferDTO> jobOffers = jobOfferService.getJobOffersByUserId(userId);
        return new ResponseEntity<>(jobOffers, HttpStatus.OK);
    }
    
    /**
     * Get all job offers by company
     * GET /LinkedApi/job-offers/company/{company}
     */
    @GetMapping("/company/{company}")
    public ResponseEntity<List<JobOfferDTO>> getJobOffersByCompany(@PathVariable String company) {
        List<JobOfferDTO> jobOffers = jobOfferService.getJobOffersByCompany(company);
        return new ResponseEntity<>(jobOffers, HttpStatus.OK);
    }
    
    /**
     * Update job offer
     * PUT /LinkedApi/job-offers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobOfferDTO> updateJobOffer(@PathVariable Long id, @RequestBody JobOfferDTO jobOfferDTO) {
        JobOfferDTO updatedJobOffer = jobOfferService.updateJobOffer(id, jobOfferDTO);
        if (updatedJobOffer != null) {
            return new ResponseEntity<>(updatedJobOffer, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Delete job offer (soft delete)
     * DELETE /LinkedApi/job-offers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        boolean deleted = jobOfferService.deleteJobOffer(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
