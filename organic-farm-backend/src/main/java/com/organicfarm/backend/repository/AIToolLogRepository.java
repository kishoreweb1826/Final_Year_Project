package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.AIToolLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIToolLogRepository extends JpaRepository<AIToolLog, Long> {

    Page<AIToolLog> findByToolType(AIToolLog.AIToolType toolType, Pageable pageable);

    Page<AIToolLog> findByUser_Id(Long userId, Pageable pageable);
}
