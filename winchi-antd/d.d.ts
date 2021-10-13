import type { OptionProps } from 'antd/lib/select'
import type { ColumnProps } from 'antd/lib/table'
import type { FormItemProps, FormListProps } from 'antd/lib/form'
import type { FormProps, FormType } from './Form'
import type { TableType, TableTypeCombineProps } from './Table'
import type { WcUploadProps } from './Upload'
import { defaultAlias } from './App'

export type Size = Exclude<SizeType, void>

export interface LayoutSize {
  width?: string | number
}

export type Render = (node: React.ComponentType<N>, nodeProps?: N) => React.ReactElement

export interface ColumnFormItemProps extends Omit<FormItemProps, 'label' | 'name' | 'initialValue'>, LayoutSize {
  width?: string | number
}

export interface ColumnFormListProps extends Omit<FormListProps, 'label' | 'name' | 'initialValue' | 'children'>, LayoutSize {
  columns: Columns[]
}

export type Methods<T extends AO = AO> = Partial<Record<TableHandleKeys | string, (row: T | T[], ...rest: any[]) => any>>

export type ColumnsEnum = Record<string | number, React.ReactNode> | OptionProps[]

export interface Columns<T extends AO = AO> extends ColumnProps<T> {
  /** 
   * @description 开启顶栏搜索
   */
  search?: boolean
  /** 
   * @description key: 方法名， value： render，在 tableType: handles 开启
   * @example src/Table/index的handles读取Click方法, 如（编辑、删除在配置栏）
    */
  handles?: Partial<
    Record<TableHandleKeys & string>,
    React.ReactNode | ((params?: Record<'onClick' & string, any>) => React.ReactNode)
  >
  /** 
   * @用作展示：优先级高于alias
   * @用作表单：优先级低于formProps.options
    */
  enum?: ColumnsEnum | AF<any[], Promise<ColumnsEnum>> | AxiosPromise<ColumnsEnum>
  /** 
   * @description column.render的返回值
    */
  fetchRenderValue?: (record: T) => React.ReactNode
  tableType?: TableType | TableTypeCombineProps | (TableType | TableTypeCombineProps)[]
  /** 
   * @type [compose的顺序，从后到前] 
   */
  formType?: FormType | FormType[]
  initialValue?: any
  /**
   * @description <Form.FormItem {...props} /> 
   *  
   */
  formItemProps?: ColumnFormItemProps
  formListProps?: ColumnFormListProps
  /** <Form.FormItem><FormComponent {...props}  /></Form.FormItem>  */
  formProps?: FormProps & LayoutSize
  hideTable?: boolean
  hideDetail?: boolean
  /**
   * @description x轴顺序
    */
  xIndex?: number
  /** 
  * @type function 针对formList (d: AO, index: Form.List第几项)
  */
  hideForm?: boolean | ((d: T, index?: number) => boolean)
  renderForm?: Render
  formResult?: false | ((v: any) => any)
}

export interface LoadingText {
  loadingText?: string
  errText?: string
}

/** handles 默认情况  */
export type TableHandleKeys = 'onRemoves'
  | 'onRemove'
  | 'onEdit'
  | 'onAdd'

export interface WcConfig {
  /**
   * @description 当前table 设置紧凑程度
    */
  size?: Size
  dataKey: GetKey
  totalKey: GetKey
  pageSize: number
  requestPageKey: string
  requestPageSizeKey: string
  defaultPage: number
  /** 
  * @description {[default TopTabKey]: value}
  */
  keys: {
    topTabKey: string
    menuKey: string
  }
  tableScroll: {
    x?: number
    y?: number
  }
  /** 
   * @description 默认别名
   */
  alias: Alias & AO
  /** 
  * @key: 事件名
  * @value: interface  LoadingText
  * @description 触发改事件，触发相应Loading
  * */
  handlesMessage: Partial<Record<TableHandleKeys, LoadingText>> & AO
  /** 
   * @example 你确定要删除吗？
    */
  handleClickBefore(name?: string | TableHandleKeys, fn: AF, args: any[]): any
  uploadConfig: Omit<WcUploadProps, 'fileList'>
}

export type Alias = typeof defaultAlias