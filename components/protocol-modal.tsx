import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProtocolModalProps {
  isOpen: boolean
  onClose: () => void
  filePath: string
}

export function ProtocolModal({ isOpen, onClose, filePath }: ProtocolModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Protocol Required</DialogTitle>
          <DialogDescription>
            {`To open ${filePath} directly from this application, you need to install our custom protocol handler. Please follow
            these steps:`}
            <ol className="list-decimal list-inside mt-2">
              <li>Download the protocol handler installer from [Your Website URL]</li>
              <li>Run the installer and follow the prompts</li>
              <li>Restart your browser</li>
              <li>Try opening the file again</li>
            </ol>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

