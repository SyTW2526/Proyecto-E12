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

interface ClientCancelationProps {
  clientName?: string;
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  refundAmount?: string;
}

export default function ClientCancelation({
  clientName = "Cliente",
  location = "Calle Ejemplo, 123, Madrid",
  checkInDate = "15/12/2025",
  checkOutDate = "20/12/2025",
  refundAmount = "€25.00",
}: ClientCancelationProps) {
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
            <Text style={paragraph}>Hola {clientName},</Text>

            <Text style={paragraph}>
              Tu reserva ha sido cancelada.
            </Text>

            {refundAmount && (
              <Section style={refundBox}>
                <Text style={refundLabel}>Reembolso: <strong>{refundAmount}</strong></Text>
                <Text style={refundNote}>Se procesará en 5-10 días hábiles</Text>
              </Section>
            )}

            <Section style={detailsBox}>
              <Text style={detailLabel}>📍 {location}</Text>
              <Text style={detailLabel}>📅 {checkInDate} - {checkOutDate}</Text>
            </Section>

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

const refundBox = {
  backgroundColor: "#ecfdf5",
  padding: "16px",
  borderRadius: "8px",
  margin: "20px 0",
};

const refundLabel = {
  fontSize: "16px",
  color: "#047857",
  margin: "0 0 8px",
};

const refundNote = {
  fontSize: "14px",
  color: "#059669",
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
