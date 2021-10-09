import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Dropdown, Menu, Popconfirm, Spin, Tooltip, Tabs, Divider } from 'antd'
import type { TabPaneProps } from 'antd/lib/tabs'
import { ColumnHeightOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import Wc, { R } from 'winchi'
import { Size } from '@src/d'
import { actionLoading } from '@src/utils'
import { useWcConfig } from '@src/hooks'
import WcForm, { FormRef } from '@src/Form'
import WcBaseTable, { WcTypeTableProps, TypeActionRef } from '../TypeTable'
import styles from './index.less'

export type HeadActionRef = TypeActionRef

export interface WcFilterTableProps<T extends AO = AO> extends WcTypeTableProps<T> {
  onClickAdd?: AF
  /** 关闭新增删除...more 的控制按键  */
  hideControl?: boolean
  /** 开启顶部过滤 */
  filter?: boolean
  controls?: {
    /** 刷新 */
    refresh?: boolean
    /** 密度 */
    density?: boolean
    /** 新增 控制处 */
    Rights?: React.ReactNode[]
    /** 删除位置 控制处 */
    Contents?: React.ReactNode[]
  }
  tabsConfig?: {
    tabs?: TabPaneProps[]
    onChange?(key: any): any,
    requestKey?: string
    defaultTab?: string
  },
  history?: boolean
}

type Model = React.FC<WcFilterTableProps>

const WcFilterTable: Model = ({
  onClickAdd,
  onLoading,
  actionRef: actionRef_ = {},
  onSelectRowChange: onSelectRowChange_,
  hideControl,
  filter = true,
  controls,
  methods: methods_ = Wc.obj,
  pagination,
  tabsConfig,
  className = '',
  style,
  preventFirtstRequest,
  Render = WcBaseTable,
  columns,
  alias = Wc.obj,
  ...props
}) => {
  const [loading, setLoading] = useState(false)
  const { wcConfig, setWcConfig } = useWcConfig()
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [currentTabKey, setCurrentTabKey] = useState()
  const filterFormValues = useMemo(() => new Map<string, Map<string, any>>(), [])
  const filterFormRef = useRef<FormRef>()
  const actionRef = useRef<HeadActionRef>()
  const selectedRowsRef = useRef<any[]>()

  const topTabKey = tabsConfig?.requestKey ?? wcConfig.topTabKey

  const composeReload = (f: AF = Wc.func, key) => (params = Wc.obj) =>
    f({
      [topTabKey]: key,
      ...filterFormValues.get(key) ?? Wc.obj,
      ...params,
    })

  useEffect(() => {
    if (actionRef.current) {
      const actionRefArr = Array.isArray(actionRef_) ? actionRef_ : [actionRef_]
      const reload = actionRef.current.reload
      actionRef.current.reload = composeReload(reload, currentTabKey)

      actionRefArr.forEach(actRef => {
        (actRef as any).current = actionRef.current
      })
    }
  })

  useEffect(() => {
    preventFirtstRequest || effectTabChange(tabsConfig?.defaultTab ?? tabsConfig?.tabs?.[0]?.tabKey)
  }, [])

  const { onRemoves, methods } = useMemo(() => {
    const { onRemoves, ...methods } = methods_

    return {
      onRemoves: onRemoves && actionLoading(wcConfig.handlesMessage.onRemoves, onRemoves),
      methods,
    }
  }, [methods_])

  const loadingHandle = (b: boolean) => {
    onLoading?.(b)
    setLoading(b)
    filterFormRef.current?.toggleSubmitLoading(b)
  }

  const refreshTable = () => {
    actionRef.current?.reload()
  }

  const selectRowChangeHandle: WcFilterTableProps['onSelectRowChange'] = (rows, keys) => {
    onSelectRowChange_?.(rows, keys)
    setSelectedRows(rows)
    selectedRowsRef.current = rows
  }

  const removeHandle = async () => {
    selectedRowsRef.current && await onRemoves?.(selectedRowsRef.current)
    actionRef.current?.reload()
  }

  const effectTabChange = (key) => {
    if (key === currentTabKey) return
    tabsConfig?.onChange?.(key)
    setCurrentTabKey(key)
    filterFormValues.set(currentTabKey!, filterFormRef.current?.getFieldsValue() || Wc.obj)
    filterFormValues.has(key) && filterFormRef.current?.setValues(filterFormValues.get(key)!)

    composeReload(actionRef.current?.reload, key)()
    return
  }

  const tabChangeHandle: AF = R.unless(
    R.equals(currentTabKey),
    effectTabChange,
  )

  const filterHandle = actionRef.current?.reload

  const resetHandle = R.compose(
    filterHandle as AF,
    () => {
      filterFormValues.delete(currentTabKey!)
    },
  )

  const getFeature = (params: AO) => {
    return params[topTabKey]
  }

  const filterJSX = useMemo(() => {
    const cc = columns.filter(R.prop('search') as any).map(o => ({
      ...o,
      hideForm: false,
      formItemProps: {
        ...o.formItemProps || Wc.obj,
        rules: undefined,
      },
    }))
    return cc.length ? (
      <>
        <WcForm
          formRef={filterFormRef}
          className={styles['top-filter']}
          columns={cc}
          alias={{
            submit: alias.search ?? wcConfig.alias?.search,
            ...alias as any,
          }}
          onSubmit={filterHandle}
          onReset={resetHandle}
        />
        <Divider dashed />
      </>
    ) : null
  }, [columns, alias, wcConfig])

  const columnHeightMenuJSX = (
    <Menu
      onClick={({ key }) => setWcConfig({ size: key as Size })}
      selectedKeys={[wcConfig.size]}
      className={styles['menu-min-width']}
    >
      {
        (['small', 'middle', 'large'] as Size[]).map(key => (
          <Menu.Item key={key}>{wcConfig.alias?.[key!]}</Menu.Item>
        ))
      }
    </Menu>
  )

  const tableHeaderJSX = (
    <header>
      <Spin
        spinning={loading}
        indicator={<></>}
      >
        <Alert
          style={{ visibility: selectedRows.length ? 'visible' : 'hidden' }}
          message={`已选择 ${selectedRows.length} 项`}
          type='info'
          action={
            <>
              {
                controls?.Contents?.map(c => c)
              }

              {
                onRemoves && (
                  <Popconfirm
                    title='确定删除吗？'
                    onConfirm={removeHandle}
                  >
                    <Button
                      size='small'
                      danger
                      type='text'
                    >
                      {/* 第一时间隐藏文字 */}
                      {selectedRows.length ? '批量删除' : ' '}
                    </Button>
                  </Popconfirm>
                )
              }

              <Button
                size='small'
                type='link'
                onClick={() => actionRef.current?.resetSelectedRows()}
              >
                {/* 第一时间隐藏文字 */}
                {selectedRows.length ? '取消选择' : ' '}
              </Button>
            </>
          }
        />
      </Spin>

      {onClickAdd ? <Button onClick={onClickAdd} type='primary'>{wcConfig.alias.add}</Button> : null}

      {
        controls?.refresh === false ? null :
          loading ? <LoadingOutlined />
            : (
              <Tooltip title='刷新'>
                <SyncOutlined onClick={refreshTable} className={styles.pointer} />
              </Tooltip>
            )
      }

      {
        controls?.density === false ? null : (
          <Tooltip title='密度'>
            <Dropdown
              overlay={columnHeightMenuJSX}
              trigger={['click']}
            >
              <ColumnHeightOutlined className={styles.pointer} />
            </Dropdown>
          </Tooltip>
        )
      }

      {
        controls?.Rights?.map(c => c)
      }
    </header>
  )

  return (
    <section style={style} className={`${styles.wrap} ${className}`}>
      {
        tabsConfig?.tabs && (
          <Tabs onChange={tabChangeHandle} defaultActiveKey={tabsConfig.defaultTab}>
            {
              tabsConfig.tabs.map(t => {
                const isLoading = currentTabKey === t.tabKey && loading

                return (
                  <Tabs.TabPane
                    key={t.tabKey}
                    {...t}
                    className={styles['tab-pane']}
                    tab={
                      <>
                        {
                          isLoading
                            ? <span className={styles['tab-spin']} ><SyncOutlined spin style={{ margin: 0 }} /></span>
                            : null
                        }
                        <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>{t.tab}</span>
                      </>
                    }
                  />
                )
              })
            }
          </Tabs>
        )
      }
      <main className={styles.table}>
        {filter ? filterJSX : null}
        {hideControl ? null : tableHeaderJSX}
        <Render
          getFeature={getFeature}
          columns={columns}
          methods={methods}
          size={wcConfig.size}
          actionRef={actionRef}
          onLoading={loadingHandle}
          onSelectRowChange={selectRowChangeHandle}
          pagination={{ ...pagination, size: wcConfig.size === 'large' ? 'default' : 'small' }}
          preventFirtstRequest={!!tabsConfig?.tabs?.length}
          {...props}
        />
      </main>
    </section >
  )
}

export default React.memo<Model>(WcFilterTable)