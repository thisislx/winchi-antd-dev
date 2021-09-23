import React from 'react'
import { Upload, UploadProps } from 'antd'
import Wc, { R } from 'winchi'
import { useWcConfig } from '@src/hooks'
import styles from './index.less'

export interface WcUploadProps extends UploadProps {

}

type Model = React.FC<WcUploadProps>


const WcUpload: Model = (props_) => {
 const { wcConfig } = useWcConfig()
 const { ...props } = Wc.mergeLeft(props_, wcConfig.upload) as WcUploadProps

 return (
  <section className={styles.wrap}>
   <Upload {...props} />
  </section>
 )
}

export default React.memo<Model>(WcUpload)