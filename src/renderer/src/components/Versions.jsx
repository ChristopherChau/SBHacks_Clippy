import { useState } from 'react'

function Versions() {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="fixed bottom-8 mx-auto py-4 font-mono inline-flex overflow-hidden items-center rounded-[22px] bg-[#202127] backdrop-blur-[24px] max-[620px]:hidden">
      <li className="block float-left border-r border-gray-700 px-5 text-sm leading-[14px] opacity-80">
        Electron v{versions.electron}
      </li>
      <li className="block float-left border-r border-gray-700 px-5 text-sm leading-[14px] opacity-80">
        Chromium v{versions.chrome}
      </li>
      <li className="block float-left px-5 text-sm leading-[14px] opacity-80">
        Node v{versions.node}
      </li>
    </ul>
  )
}

export default Versions
