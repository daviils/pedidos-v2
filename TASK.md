# FLUXO DE TASK

## MESA / TABLE
- criar um crud de mesa (id,name,status)

## ORDER
- crud de order(id, productId, tableId, createdAt, updatedAt, deletedAt)
- ao criar order criar table_session

## TABLE_SESSION
- inicia sessão (id,status,createdAt,tableId,orderId)
- se table está close ao fazer pedido, passa a ficar open e cria um novo table session
- ao solicitar pedido de conta table volta para close

