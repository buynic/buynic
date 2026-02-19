"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "./Button"
import { cn } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    className?: string
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    className,
}: ModalProps) {
    const [showModal, setShowModal] = React.useState(isOpen)

    React.useEffect(() => {
        setShowModal(isOpen)
    }, [isOpen])

    if (!showModal) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
                {children}
            </div>
        </div>
    )
}
