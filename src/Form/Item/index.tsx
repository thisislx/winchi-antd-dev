import React, { useContext } from 'react'
import Wc from 'winchi'
import { Form } from 'antd'
import type { Columns } from '@src/d'
import { AppContext } from '@src/App'
import styles from './index.less'
import { propFormTypeFC } from '..'
import { WcResolveChidrenProps } from '../ResolveChidren'

export interface WcFormItemProps<T extends AO = AO> extends Columns<T>, WcResolveChidrenProps {

}

type Model = React.FC<WcFormItemProps>

const WcFormItem: Model = ({
 dataIndex,
 title,
 formType,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 formItemProps: { width, className = '', style = Wc.obj, ...formItemProps } = Wc.obj,
 formProps = {},
 hide,
 initialValue,
 ...restColumn
}) => {
 const { appConfig } = useContext(AppContext)
 const C = propFormTypeFC(formType)

 return (
  <Form.Item
   key={`${dataIndex}`}
   className={`${styles['form-item']} ${className}`}
   {...formItemProps}
   name={`${dataIndex}`}
   label={title}
   style={{
    width,
    ...style,
    display: hide ? 'none' : style?.display
   }}
  >
   <C
    size={appConfig.size}
    options={restColumn.enum}
    wcInitVal={initialValue ?? formItemProps.initialValue}
    dataIndex={dataIndex}
    {...formProps}
    style={{ width: formProps.width, ...formProps.style || {} }}
   />
  </Form.Item>
 )
}

export default React.memo<Model>(WcFormItem)