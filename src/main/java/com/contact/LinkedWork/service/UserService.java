package com.contact.LinkedWork.service;

import com.contact.LinkedWork.dto.UserDTO;
import com.contact.LinkedWork.model.User;
import com.contact.LinkedWork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Create a new user
    public UserDTO createUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setFullName(userDTO.getFullName());
        user.setBio(userDTO.getBio());
        user.setProfileImageUrl(userDTO.getProfileImageUrl());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }
    
    // Get all active users
    public List<UserDTO> getAllUsers() {
        return userRepository.findAllByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get user by ID
    public Optional<UserDTO> getUserById(Long id) {
        Optional<User> user = userRepository.findByIdAndActiveTrue(id);
        return user.map(this::convertToDTO);
    }
    
    // Get user by email
    public Optional<UserDTO> getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(this::convertToDTO);
    }
    
    // Update user
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFullName(userDTO.getFullName());
            user.setBio(userDTO.getBio());
            user.setProfileImageUrl(userDTO.getProfileImageUrl());
            user.setUpdatedAt(LocalDateTime.now());
            
            User updatedUser = userRepository.save(user);
            return convertToDTO(updatedUser);
        }
        return null;
    }
    
    // Delete user (soft delete)
    public boolean deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User userToDelete = user.get();
            userToDelete.setActive(false);
            userToDelete.setUpdatedAt(LocalDateTime.now());
            userRepository.save(userToDelete);
            return true;
        }
        return false;
    }
    
    // Convert User entity to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setBio(user.getBio());
        userDTO.setProfileImageUrl(user.getProfileImageUrl());
        userDTO.setCreatedAt(user.getCreatedAt());
        userDTO.setUpdatedAt(user.getUpdatedAt());
        userDTO.setActive(user.getActive());
        return userDTO;
    }
}
