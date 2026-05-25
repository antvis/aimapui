import { examples } from '@/data/examples'
import ExampleClientPage from '@/components/ExampleClientPage'
import { GetStaticPaths, GetStaticProps } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = examples.map((e) => ({ params: { slug: e.id } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const example = examples.find((e) => e.id === params?.slug)
  if (!example) {
    return { notFound: true }
  }
  return { props: { example } }
}

export default function ExamplePage({ example }: { example: any }) {
  return <ExampleClientPage example={example} />
}