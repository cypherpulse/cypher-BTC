;; CypherBTC Token Contract - SIP-010 Style Fungible Token

(define-fungible-token cBTC)

(define-constant CONTRACT-OWNER tx-sender)

(define-constant TOTAL-SUPPLY u1000000000)

(define-data-var total-supply uint u0)

;; Transfer function 
;; Parameters: amount (uint), sender (principal), recipient (principal)
;; Only the sender can initiate transfer on their behalf
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u3)) ;; Amount must be positive
    (asserts! (is-eq tx-sender sender) (err u1)) ;; Only sender can transfer their tokens
    (asserts! (is-standard recipient) (err u5)) ;; Recipient must be a standard principal
    (try! (ft-transfer? cBTC amount sender recipient))
    (ok true)
  )
)

;; Mint function
;; Parameters: amount (uint), recipient (principal)
;; Only contract owner can mint new tokens
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u4)) ;; Amount must be positive
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u2)) ;; Only owner can mint
    (asserts! (is-standard recipient) (err u6)) ;; Recipient must be a standard principal
    (asserts! (<= (+ (var-get total-supply) amount) TOTAL-SUPPLY) (err u7)) ;; Cannot exceed total supply
    (try! (ft-mint? cBTC amount recipient))
    (var-set total-supply (+ (var-get total-supply) amount))
    (ok true)
  )
)

;; Get balance of a principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance cBTC who))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok TOTAL-SUPPLY)
)

;; Get token name
(define-read-only (get-name)
  (ok "CypherBTC")
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok "cBTC")
)

;; Get decimals
(define-read-only (get-decimals)
  (ok u6)
)

;; Get contract owner (for testing purposes)
(define-read-only (get-contract-owner)
  (ok CONTRACT-OWNER)
)