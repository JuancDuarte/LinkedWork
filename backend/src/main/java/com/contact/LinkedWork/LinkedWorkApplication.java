package com.contact.LinkedWork;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LinkedWorkApplication {

	public static void main(String[] args) {
		SpringApplication.run(LinkedWorkApplication.class, args);
	}

	@Bean
	public CommandLineRunner schemaUpdater(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				// Add FechaServicio to Solicitud if it doesn't exist
				jdbcTemplate.execute("ALTER TABLE Solicitud ADD COLUMN FechaServicio DATE");
				System.out.println("Columna FechaServicio agregada correctamente.");
			} catch (Exception e) {
				System.out.println("Columna FechaServicio ya existe o error al agregarla: " + e.getMessage());
			}
		};
	}
}





