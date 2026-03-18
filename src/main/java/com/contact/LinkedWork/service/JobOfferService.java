package com.contact.LinkedWork.service;

import com.contact.LinkedWork.dto.JobOfferDTO;
import com.contact.LinkedWork.model.JobOffer;
import com.contact.LinkedWork.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobOfferService {
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    // Create a new job offer
    public JobOfferDTO createJobOffer(JobOfferDTO jobOfferDTO) {
        JobOffer jobOffer = new JobOffer();
        jobOffer.setTitle(jobOfferDTO.getTitle());
        jobOffer.setDescription(jobOfferDTO.getDescription());
        jobOffer.setCompany(jobOfferDTO.getCompany());
        jobOffer.setLocation(jobOfferDTO.getLocation());
        jobOffer.setSalaryRange(jobOfferDTO.getSalaryRange());
        jobOffer.setUserId(jobOfferDTO.getUserId());
        jobOffer.setCreatedAt(LocalDateTime.now());
        jobOffer.setUpdatedAt(LocalDateTime.now());
        jobOffer.setActive(true);
        
        JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
        return convertToDTO(savedJobOffer);
    }
    
    // Get all active job offers
    public List<JobOfferDTO> getAllJobOffers() {
        return jobOfferRepository.findAllByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get job offer by ID
    public Optional<JobOfferDTO> getJobOfferById(Long id) {
        Optional<JobOffer> jobOffer = jobOfferRepository.findByIdAndActiveTrue(id);
        return jobOffer.map(this::convertToDTO);
    }
    
    // Get all job offers by user ID
    public List<JobOfferDTO> getJobOffersByUserId(Long userId) {
        return jobOfferRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get all job offers by company
    public List<JobOfferDTO> getJobOffersByCompany(String company) {
        return jobOfferRepository.findByCompanyAndActiveTrue(company)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Update job offer
    public JobOfferDTO updateJobOffer(Long id, JobOfferDTO jobOfferDTO) {
        Optional<JobOffer> existingJobOffer = jobOfferRepository.findById(id);
        if (existingJobOffer.isPresent()) {
            JobOffer jobOffer = existingJobOffer.get();
            jobOffer.setTitle(jobOfferDTO.getTitle());
            jobOffer.setDescription(jobOfferDTO.getDescription());
            jobOffer.setCompany(jobOfferDTO.getCompany());
            jobOffer.setLocation(jobOfferDTO.getLocation());
            jobOffer.setSalaryRange(jobOfferDTO.getSalaryRange());
            jobOffer.setUpdatedAt(LocalDateTime.now());
            
            JobOffer updatedJobOffer = jobOfferRepository.save(jobOffer);
            return convertToDTO(updatedJobOffer);
        }
        return null;
    }
    
    // Delete job offer (soft delete)
    public boolean deleteJobOffer(Long id) {
        Optional<JobOffer> jobOffer = jobOfferRepository.findById(id);
        if (jobOffer.isPresent()) {
            JobOffer jobOfferToDelete = jobOffer.get();
            jobOfferToDelete.setActive(false);
            jobOfferToDelete.setUpdatedAt(LocalDateTime.now());
            jobOfferRepository.save(jobOfferToDelete);
            return true;
        }
        return false;
    }
    
    // Convert JobOffer entity to JobOfferDTO
    private JobOfferDTO convertToDTO(JobOffer jobOffer) {
        JobOfferDTO jobOfferDTO = new JobOfferDTO();
        jobOfferDTO.setId(jobOffer.getId());
        jobOfferDTO.setTitle(jobOffer.getTitle());
        jobOfferDTO.setDescription(jobOffer.getDescription());
        jobOfferDTO.setCompany(jobOffer.getCompany());
        jobOfferDTO.setLocation(jobOffer.getLocation());
        jobOfferDTO.setSalaryRange(jobOffer.getSalaryRange());
        jobOfferDTO.setUserId(jobOffer.getUserId());
        jobOfferDTO.setCreatedAt(jobOffer.getCreatedAt());
        jobOfferDTO.setUpdatedAt(jobOffer.getUpdatedAt());
        jobOfferDTO.setActive(jobOffer.getActive());
        return jobOfferDTO;
    }
}
