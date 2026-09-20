import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'서울, 우리의 한마디',description:'우리의 생각이 모여 만드는 서울. 실시간 참여형 워드클라우드.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
