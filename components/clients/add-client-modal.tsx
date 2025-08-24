"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: () => void
}

interface ClientFormData {
  companyName: string
  contactPerson: {
    firstName: string
    lastName: string
  }
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  businessType: string
  industry: string
  accountType: string
  creditLimit: number
  paymentTerms: string
  notes: string
  preferences: {
    preferredAirports: string[]
    cargoTypes: string[]
    specialRequirements: string[]
  }
}

const businessTypes = [
  "IMPORTER",
  "EXPORTER", 
  "FREIGHT_FORWARDER",
  "LOGISTICS_PROVIDER",
  "SHIPPER",
  "CONSIGNEE"
]

const accountTypes = [
  "STANDARD",
  "PREMIUM",
  "ENTERPRISE"
]

const paymentTerms = [
  "NET_15",
  "NET_30", 
  "NET_60",
  "NET_90",
  "IMMEDIATE"
]

export function AddClientModal({ isOpen, onClose, onClientAdded }: AddClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [airports, setAirports] = useState<Array<{code: string, city: string, country: string}>>([])
  const [airportsLoading, setAirportsLoading] = useState(true)
  
  // Fetch airports from API when component mounts
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setAirportsLoading(true)
        const response = await fetch('/api/flights/airports')
        
        if (response.ok) {
          const airportsData = await response.json()
          setAirports(airportsData)
        } else {
          console.error('Failed to fetch airports:', response.status)
          setAirports([])
        }
      } catch (error) {
        console.error('Error fetching airports:', error)
        setAirports([])
      } finally {
        setAirportsLoading(false)
      }
    }

    fetchAirports()
  }, [])

  const [formData, setFormData] = useState<ClientFormData>({
    companyName: "",
    contactPerson: {
      firstName: "",
      lastName: ""
    },
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    businessType: "",
    industry: "",
    accountType: "STANDARD",
    creditLimit: 0,
    paymentTerms: "NET_30",
    notes: "",
    preferences: {
      preferredAirports: [],
      cargoTypes: [],
      specialRequirements: []
    }
  })

  const [newCargoType, setNewCargoType] = useState("")
  const [newRequirement, setNewRequirement] = useState("")

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ClientFormData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayChange = (field: keyof ClientFormData['preferences'], value: string, action: 'add' | 'remove') => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: action === 'add' 
          ? [...(prev.preferences[field] as string[]), value]
          : (prev.preferences[field] as string[]).filter(item => item !== value)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyName || !formData.contactPerson.firstName || !formData.contactPerson.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newClient = await response.json()
        toast.success(`Client "${newClient.companyName}" created successfully!`)
        onClientAdded()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create client')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: { firstName: "", lastName: "" },
      email: "",
      phone: "",
      address: { street: "", city: "", state: "", country: "", postalCode: "" },
      businessType: "",
      industry: "",
      accountType: "STANDARD",
      creditLimit: 0,
      paymentTerms: "NET_30",
      notes: "",
      preferences: { preferredAirports: [], cargoTypes: [], specialRequirements: [] }
    })
    setNewCargoType("")
    setNewRequirement("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client account with complete business information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Electronics, Logistics, Automotive"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.contactPerson.firstName}
                  onChange={(e) => handleInputChange('contactPerson.firstName', e.target.value)}
                  placeholder="Contact person's first name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.contactPerson.lastName}
                  onChange={(e) => handleInputChange('contactPerson.lastName', e.target.value)}
                  placeholder="Contact person's last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@company.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1-555-0123"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="123 Business Ave"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="City"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="State"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  placeholder="Postal Code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) => handleInputChange('address.country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => handleInputChange('creditLimit', parseInt(e.target.value) || 0)}
                  placeholder="50000"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTerms.map(term => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Preferences</h3>
            
            <div className="space-y-2">
              <Label>Preferred Airports</Label>
              <div className="flex flex-wrap gap-2">
                {airports.map(airport => (
                  <Badge
                    key={airport.code}
                    variant={formData.preferences.preferredAirports.includes(airport.code) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      const isSelected = formData.preferences.preferredAirports.includes(airport.code)
                      handleArrayChange('preferredAirports', airport.code, isSelected ? 'remove' : 'add')
                    }}
                  >
                    {airport.code}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cargo Types</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add cargo type"
                  value={newCargoType}
                  onChange={(e) => setNewCargoType(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCargoType.trim()) {
                      e.preventDefault()
                      handleArrayChange('cargoTypes', newCargoType.trim(), 'add')
                      setNewCargoType("")
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newCargoType.trim()) {
                      handleArrayChange('cargoTypes', newCargoType.trim(), 'add')
                      setNewCargoType("")
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferences.cargoTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                    {type}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleArrayChange('cargoTypes', type, 'remove')}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newRequirement.trim()) {
                      e.preventDefault()
                      handleArrayChange('specialRequirements', newRequirement.trim(), 'add')
                      setNewRequirement("")
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newRequirement.trim()) {
                      handleArrayChange('specialRequirements', newRequirement.trim(), 'add')
                      setNewRequirement("")
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferences.specialRequirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                    {req}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleArrayChange('specialRequirements', req, 'remove')}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information about this client..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
