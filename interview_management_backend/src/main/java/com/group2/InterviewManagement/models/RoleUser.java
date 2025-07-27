package com.group2.InterviewManagement.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.group2.InterviewManagement.models.key.KeyRoleUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Role_User")
public class RoleUser {
    @EmbeddedId
    KeyRoleUser keyRoleUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_RoleUser_Role")
    )
    @MapsId(value = "roleId")
    @JsonBackReference
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_RoleUser_User")
    )
    @MapsId(value = "userId")
    @JsonBackReference
    private User user;
}
