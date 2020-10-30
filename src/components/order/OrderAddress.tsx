/* eslint-disable no-console */
import { DeleteOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import React, { FC, useCallback, useState } from 'react'

import { useOrder } from '../../contexts/order/OrderContext'
import { useTenantConfig } from '../../contexts/TenantContext'
import { useAltIntl } from '../../intlConfig'
import { WorldAddress } from '../../typings'
import AddressDisplay from '../common/AddressDisplay'
import SelectAddress from '../common/SelectAddress'
import { calculaTempoEDistancia } from '../common/useHere'

type Props = { onAddress: (data: Partial<WorldAddress>) => void }

type RoutingParams = {
  clientLat: number
  clientLng: number
  tenantLat: number
  tenantLng: number
}

const OrderAddress: FC<Props> = () => {
  const { tenant } = useTenantConfig()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setClientContext = useCallback(
    (data: WorldAddress) => {
      const formData = data
      // TESTING ROUTING CALCULATION USING HERE ROUTING API
      const routingData = {
        clientLat: formData.lat,
        clientLng: formData.lng,
        tenantLat: tenant?.address?.lat,
        tenantLng: tenant?.address?.lng,
      }

      calculaTempoEDistancia(routingData as RoutingParams)
    },
    [tenant]
  )

  const intl = useAltIntl()
  const [modal, setModal] = useState(false)
  const [{ order }, dispatch] = useOrder()

  const selectedAddress = order?.shipping?.address
  const hasAddress = Object.keys(selectedAddress ?? {}).length > 0

  const onSelectedAddress = useCallback(
    (data: WorldAddress) => {
      setClientContext(data)
      dispatch({ type: 'SET_CUSTOMER_ADDRESS', args: data })
      setModal(false)
    },
    [dispatch, setClientContext]
  )

  // Refact this. Terrible UX (no confirm and no edit option)
  const onDeleteAddress = useCallback(() => {
    dispatch({ type: 'SET_CUSTOMER_ADDRESS', args: {} as WorldAddress })
  }, [dispatch])

  return (
    <div className="flex flex-column items-center">
      {!hasAddress && (
        <>
          <span className="tc mb4">
            {intl.formatMessage({ id: 'address.noAddress' })}
          </span>
          <Button size="large" type="primary" onClick={() => setModal(true)}>
            {intl.formatMessage({ id: 'address.selectAddress' })}
          </Button>
        </>
      )}
      {hasAddress && (
        <div className="flex flex-column w-100 pa2">
          <Card
            title="Endereço Selecionado"
            className="w-100"
            actions={[
              <DeleteOutlined onClick={onDeleteAddress} key="setting" />,
            ]}
          >
            <AddressDisplay address={selectedAddress} />
          </Card>
        </div>
      )}
      <Modal visible={modal} footer={null} onCancel={() => setModal(false)}>
        <SelectAddress onValidAddress={onSelectedAddress} />
      </Modal>
    </div>
  )
}

export default OrderAddress
