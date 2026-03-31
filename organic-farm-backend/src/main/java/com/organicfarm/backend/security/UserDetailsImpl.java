    package com.organicfarm.backend.security;

    import com.organicfarm.backend.model.User;
    import lombok.AllArgsConstructor;
    import lombok.Getter;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;

    import java.util.Collection;
    import java.util.List;

    @Getter
    @AllArgsConstructor
    public class UserDetailsImpl implements UserDetails {

        private final Long id;
        private final String email;
        private final String password;
        private final String name;
        private final User.UserRole role;
        private final boolean emailVerified;

        public static UserDetailsImpl build(User user) {
            return new UserDetailsImpl(
                    user.getId(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getName(),
                    user.getRole(),
                    user.isEmailVerified());
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
        }

        @Override
        public String getUsername() {
            return email;
        }

        @Override public boolean isAccountNonExpired()     { return true; }
        @Override public boolean isAccountNonLocked()      { return true; }
        @Override public boolean isCredentialsNonExpired() { return true; }
        @Override public boolean isEnabled()               { return true; }
    }
