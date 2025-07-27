package com.group2.InterviewManagement.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "CommonValue")
public class CommonValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "name", nullable = false)
    @Nationalized
    private String name;

    @Column(name = "index_key", nullable = false)
    private int indexKey;

    @Column(name = "value", nullable = false)
    @Nationalized
    private String value;
}
