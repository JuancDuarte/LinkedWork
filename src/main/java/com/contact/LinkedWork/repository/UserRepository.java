package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByIdAndActiveTrue(Long id);
    
    java.util.List<User> findAllByActiveTrue();
}
