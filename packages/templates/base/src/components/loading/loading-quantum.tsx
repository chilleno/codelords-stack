import 'ldrs/react/Quantum.css'
import { Quantum } from 'ldrs/react'

const loadingQuantum = ({ open }: { open: boolean }) => {
    if (!open) return null;
    return (
        <div>
            <div
                className="fixed inset-0 bg-gray-500/75 dark:bg-[#0f1827]/75 transition-opacity opacity-70 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                    <Quantum
                        size="45"
                        speed="1.75"
                        color="white"
                    />
                </div>
            </div>
        </div>
    )
}

export default loadingQuantum;