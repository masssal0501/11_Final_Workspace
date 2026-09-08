package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="amount_support")

@NoArgsConstructor
@Setter
@Getter
@ToString

public class Amount {
  
	@Id
	@GeneratedValue(strategy =GenerationType.IDENTITY)
	@Column(name="amount_no")
    private Integer amountNo;

    @Column(name="approved_amount")
    private Integer approvedAmount;

    @Column(name="requested_at", nullable=false )
    private LocalDateTime requestedAt;

    @Column(name="approved_at")
    private LocalDateTime approvedAt;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Column(name="status", length=10, nullable =false)
    private String status;

    @Column(name="amount_comment", length = 300)
    private String amountComment;

    @Column(name="workcation_no", nullable=false)
    private Integer workcationNo;

    //양방향 연관 관계 부모가 삭제되거나 수정될때 동시제어
    @OneToMany(mappedBy = "amount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AmountItem> itemList = new ArrayList<>();
    
    @OneToMany(mappedBy = "amount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupportList> supportList = new ArrayList<>();
    
    @OneToMany(mappedBy = "amount" ,cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AmountFile> amountFile = new ArrayList<>();

}