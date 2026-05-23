import { examples } from '@/data/examples'
import { notFound } from 'next/navigation'
import ExampleClientPage from './ExampleClientPage'

// generateStaticParams 供 output: 'export' 静态导出时预生成页面
export function generateStaticParams() {
  return examples.map((e) => ({ slug: e.id }))
}

interface ExamplePageProps {
  params: {
    slug: string
  }
}

export default function ExamplePage({ params }: ExamplePageProps) {
  const example = examples.find((e) => e.id === params.slug)

  if (!example) {
    notFound()
  }

  return <ExampleClientPage example={example} />
}