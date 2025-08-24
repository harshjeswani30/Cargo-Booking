"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Mail, Phone, MapPin, Package, AlertCircle, Loader2, Edit, Trash2, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { AddClientModal } from "@/components/clients/add-client-modal"
import { toast } from "sonner"

interface Client {
  _id: string
  clientId: string
  companyName: string
  contactPerson: {
    firstName: string
    lastName: string
  }
  email: string
  phone: string
  address: {
    city: string
    country: string
  }
  businessType: string
  industry: string
  accountType: string
  status: string
  creditLimit: number
  paymentTerms: string
  notes: string
  preferences: {
    preferredAirports: string[]
    cargoTypes: string[]
    specialRequirements: string[]
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(client =>
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClients(filtered)
    }
  }, [searchTerm, clients])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data.clients || [])
      setFilteredClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const handleClientAdded = () => {
    fetchClients() // Refresh the client list
  }

  const handleDeleteClient = async (clientId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete ${companyName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success(`Client "${companyName}" deleted successfully`)
        fetchClients() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
    }
  }

  const getBusinessTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'IMPORTER': 'bg-blue-100 text-blue-800',
      'EXPORTER': 'bg-green-100 text-green-800',
      'FREIGHT_FORWARDER': 'bg-purple-100 text-purple-800',
      'LOGISTICS_PROVIDER': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getAccountTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'STANDARD': 'bg-gray-100 text-gray-800',
      'PREMIUM': 'bg-yellow-100 text-yellow-800',
      'ENTERPRISE': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading clients...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2">Clients</h1>
            <p className="text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? 's' : ''} • Manage your client relationships
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients by name, contact, or email..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No clients found' : 'No clients available'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No client data has been added yet.'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client._id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {client.contactPerson.firstName[0]}{client.contactPerson.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{client.companyName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {client.contactPerson.firstName} {client.contactPerson.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getBusinessTypeColor(client.businessType)}>
                        {client.businessType.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={getAccountTypeColor(client.accountType)}>
                        {client.accountType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{client.address.city}, {client.address.country}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="ml-1 font-medium">{client.industry}</span>
                    </div>
                    
                    {client.preferences?.cargoTypes && (
                      <div className="flex flex-wrap gap-1">
                        {client.preferences.cargoTypes.slice(0, 3).map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {client.preferences.cargoTypes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{client.preferences.cargoTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Credit Limit:</span>
                      <span className="font-medium">${client.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Terms:</span>
                      <span className="font-medium">{client.paymentTerms}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClient(client._id, client.companyName)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Client Modal */}
        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onClientAdded={handleClientAdded}
        />
      </main>
    </div>
  )
}
