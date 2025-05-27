import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { TableColumnType, TableProps } from 'antd';

export interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

export interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

export interface DragSortSingleTableProps<RecordType = any>
  extends Omit<TableProps<RecordType>, 'columns'> {
  rowKey?: string | ((record: RecordType) => string);
  initialDataSource: RecordType[];
  isDrag?: boolean;
  columns: TableColumnType<RecordType>[];
  renderDragHandle?: React.ReactNode | undefined;
  onDragSortEnd?: (newDataSource: RecordType[]) => void;
}
