import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OwnerCancelationProps {
  ownerName?: string;
  clientName?: string;
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  lostAmount?: string;
}

export default function OwnerCancelation({
  ownerName = "Propietario",
  clientName = "Nombre del Cliente",
  location = "Calle Ejemplo, 123, Madrid",
  checkInDate = "15/12/2025",
  checkOutDate = "20/12/2025",
  lostAmount = "€25.00",
}: OwnerCancelationProps) {
  return (
    <Html>
      <Head />
      <Preview>Reserva Cancelada - QuickPark</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={iconSection}>
            <Text style={cancelIcon}>✕</Text>
          </Section>

          <Heading style={heading}>Reserva Cancelada</Heading>

          <Section style={content}>
            <Text style={paragraph}>Hola {ownerName},</Text>

            <Text style={paragraph}>
              Una reserva para tu plaza de parking ha sido cancelada.
            </Text>

            {lostAmount && (
              <Section style={lostBox}>
                <Text style={lostLabel}>Ingresos perdidos: <strong>{lostAmount}</strong></Text>
                <Text style={lostNote}>El cliente recibirá un reembolso del 50%</Text>
              </Section>
            )}

            <Section style={detailsBox}>
              <Text style={detailLabel}>👤 Cliente: {clientName}</Text>
              <Text style={detailLabel}>📍 {location}</Text>
              <Text style={detailLabel}>📅 {checkInDate} - {checkOutDate}</Text>
            </Section>

            <Text style={paragraph}>
              Tu plaza está disponible nuevamente.
            </Text>

            <Text style={paragraph}>
              Saludos,<br />
              <strong>QuickPark</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "500px",
};

const iconSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const cancelIcon = {
  fontSize: "48px",
  color: "#dc2626",
  margin: "0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1f2937",
  margin: "0 0 24px",
};

const content = {
  padding: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px",
};

const lostBox = {
  backgroundColor: "#fef2f2",
  padding: "16px",
  borderRadius: "8px",
  margin: "20px 0",
};

const lostLabel = {
  fontSize: "16px",
  color: "#b91c1c",
  margin: "0 0 8px",
};

const lostNote = {
  fontSize: "14px",
  color: "#dc2626",
  margin: "0",
};

const detailsBox = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "20px 0",
};

const detailLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 8px",
};
