import React, { useMemo } from 'react';
import type { SelectProps } from 'antd/lib/select';
import { Select } from 'antd';

export interface MySelectProps extends SelectProps<any> {
  request?: AF
  valueEnum?: AO
}

type Model = React.FC<MySelectProps>;

const _AO: AO = {};
const MySelect: Model = ({ valueEnum: valueEnum_ = _AO, ...props }) => {
  const valueEnum = useMemo(
    () =>
      Object.entries(valueEnum_).map(([value, key]) => ({
        key,
        label: key,
        value,
      })),
    [valueEnum_],
  );

  return (
    <Select {...props}>
      {valueEnum.map((item) => (
        <Select.Option key={item.key} value={item.value}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default React.memo<Model>(MySelect);