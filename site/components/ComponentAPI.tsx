/**
 * ComponentAPI 组件 - 用于组件文档中显示 Props 表格
 */

interface APIProp {
  /** 属性名 */
  name: string
  /** 类型 */
  type: string
  /** 默认值 */
  defaultValue?: string
  /** 是否必填 */
  required?: boolean
  /** 说明 */
  description: string
}

interface ComponentAPIProps {
  /** 组件属性列表 */
  props: APIProp[]
  /** 标题 */
  title?: string
}

export function ComponentAPI({ props, title = 'API' }: ComponentAPIProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>{title}</h3>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>属性</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>类型</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>默认值</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>必填</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>说明</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px' }}>
                  <code style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#f1f5f9',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#7c3aed'
                  }}>
                    {prop.name}
                  </code>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <code style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#eff6ff',
                    fontSize: '0.82rem',
                    color: '#2563eb'
                  }}>
                    {prop.type}
                  </code>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {prop.defaultValue ? (
                    <code style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: '#f0fdf4',
                      fontSize: '0.82rem',
                      color: '#16a34a'
                    }}>
                      {prop.defaultValue}
                    </code>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {prop.required ? (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>必填</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>选填</span>
                  )}
                </td>
                <td style={{ padding: '10px 12px', color: '#475569', lineHeight: 1.5 }}>{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * SchemaTable 组件 - 用于显示 Schema 属性表格
 */

interface SchemaField {
  /** 字段名 */
  field: string
  /** 类型 */
  type: string
  /** 默认值 */
  defaultValue?: string
  /** 说明 */
  description: string
}

interface SchemaTableProps {
  /** 字段列表 */
  fields: SchemaField[]
  /** 标题 */
  title?: string
}

export function SchemaTable({ fields, title = 'Schema 属性' }: SchemaTableProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>{title}</h3>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>字段</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>类型</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>默认值</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>说明</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.field} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px' }}>
                  <code style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#fefce8',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#a16207'
                  }}>
                    {field.field}
                  </code>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <code style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#eff6ff',
                    fontSize: '0.82rem',
                    color: '#2563eb'
                  }}>
                    {field.type}
                  </code>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {field.defaultValue ? (
                    <code style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: '#f0fdf4',
                      fontSize: '0.82rem',
                      color: '#16a34a'
                    }}>
                      {field.defaultValue}
                    </code>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '10px 12px', color: '#475569', lineHeight: 1.5 }}>{field.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}