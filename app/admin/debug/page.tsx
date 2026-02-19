'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

export default function DebugPage() {
    const [status, setStatus] = useState<string>("Initializing...")
    const [user, setUser] = useState<any>(null)
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])

    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        addLog("Checking session...")
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            setUser(session.user)
            addLog(`User logged in: ${session.user.email}`)
        } else {
            addLog("No user logged in. Please log in first.")
        }
    }

    const testInsert = async () => {
        if (!user) {
            toast.error("Please login first")
            return
        }

        addLog("Attempting to insert test product...")
        const testProduct = {
            name: "Test Product " + Date.now(),
            description: "Debug test",
            category: "Electronics",
            sale_price: 100,
            actual_price: 200,
            image_url: "https://via.placeholder.com/150",
            return_available: true
        }

        const { data, error } = await supabase
            .from('products')
            .insert(testProduct)
            .select()

        if (error) {
            addLog(`❌ INSERT FAILED: ${error.message} (Code: ${error.code})`)
            addLog(`Details: ${JSON.stringify(error, null, 2)}`)
        } else {
            addLog("✅ INSERT SUCCESS! Product added.")
            addLog(`Data: ${JSON.stringify(data, null, 2)}`)
        }
    }

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Supabase Debugyer</h1>

            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p><strong>User:</strong> {user ? user.email : "Not logged in"}</p>
                <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            </div>

            <div className="flex gap-4 mb-6">
                <Button onClick={checkConnection}>Refresh Session</Button>
                <Button onClick={testInsert} variant="default">Test Insert Product</Button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm min-h-[300px] overflow-auto whitespace-pre-wrap">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    )
}
