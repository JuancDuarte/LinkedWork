package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Usuario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("CrudUsuarioRepository")
public interface UsuarioRepository extends CrudRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String Email);
    
    Optional<Usuario> findByNombreUsuario(String NombreUsuario);
    
    List<Usuario> findAllByEstado(String Estado);
    
    Optional<Usuario> findByidUsuario(Long IdUsuario);
}
