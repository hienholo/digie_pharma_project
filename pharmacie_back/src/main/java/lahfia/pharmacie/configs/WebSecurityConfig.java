package lahfia.pharmacie.configs;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable()) // Désactive CSRF (optionnel)
                                // 2. Active CORS → c'est ici que tu branches ton bean
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll() // Autorise Swagger et les API docs
                                                // Route cabine protégée
                                                //.requestMatchers("/api/commandes/ma-cabine").authenticated()  // une authentification
                                                .anyRequest().permitAll()
                                )
                                // .formLogin(form -> form.permitAll()) // Active le formulaire de login
                                .formLogin(form -> form.disable()) // Désactive le formulaire de login
                                .httpBasic(Customizer.withDefaults()); // Désactive HTTP Basic Auth/ Active HTTP Basic
                                                                      // Auth (optionnel)

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // Ajoute ou modifie dans WebSecurityConfig ou une nouvelle @Configuration
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
        "https://digie-pharma.com",
        "http://digie-pharma.com",
        "http://localhost:5173",
        "http://localhost:3000",
        // Test depuis un téléphone sur le même réseau local (adresse LAN du poste de dev)
        "http://192.168.1.85:5173",
        "http://192.168.1.85:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
        }
}
