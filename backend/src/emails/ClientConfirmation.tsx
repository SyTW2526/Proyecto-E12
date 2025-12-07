import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ClientConfirmationProps {
  clientName?: string;
  location?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  duration?: string;
  daysCount?: string;
  pricePerDay?: string;
  totalPrice?: string;
}

export default function ClientConfirmation({
  clientName = "Cliente",
  location = "Calle Ejemplo, 123, Madrid",
  checkInDate = "15/12/2025",
  checkInTime = "10:00 AM",
  checkOutDate = "20/12/2025",
  checkOutTime = "10:00 AM",
  duration = "5 días",
  daysCount = "5",
  pricePerDay = "€10.00",
  totalPrice = "€50.00",
}: ClientConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Reserva Confirmada! - QuickPark</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Check Icon */}
          <Section style={iconSection}>
            <div style={checkCircle}>
              <Text style={checkmark}>✓</Text>
            </div>
          </Section>

          <Heading style={heading}>¡Reserva Confirmada!</Heading>

          <Hr style={divider} />

          {/* Contenido Principal */}
          <Section style={content}>
            <Text style={greeting}>Hola <strong>{clientName}</strong>,</Text>

            <Text style={paragraph}>
              Tu reserva ha sido confirmada con éxito. A continuación encontrarás todos los detalles de tu parking.
            </Text>

            {/* Detalles de la Reserva */}
            <Section style={detailsBox}>
              <Heading as="h3" style={detailsHeading}>
                Detalles de la Reserva
              </Heading>

              {/* Ubicación */}
              <Section style={detailItem}>
                <table style={detailTable}>
                  <tr>
                    <td style={iconCell}>
                      <div style={detailIconCircle}>
                        <Text style={detailIcon}>📍</Text>
                      </div>
                    </td>
                    <td style={detailContent}>
                      <Text style={detailLabel}>Ubicación</Text>
                      <Text style={detailValue}>{location}</Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Fechas */}
              <table style={dateTable}>
                <tr>
                  <td style={dateCell}>
                    <Text style={dateLabel}>Fecha de entrada</Text>
                    <Text style={dateValue}>{checkInDate}</Text>
                    <Text style={dateTime}>{checkInTime}</Text>
                  </td>
                  <td style={{ width: "20px" }}></td>
                  <td style={dateCell}>
                    <Text style={dateLabel}>Fecha de salida</Text>
                    <Text style={dateValue}>{checkOutDate}</Text>
                    <Text style={dateTime}>{checkOutTime}</Text>
                  </td>
                </tr>
              </table>

              {/* Duración */}
              <Section style={durationSection}>
                <table style={durationTable}>
                  <tr>
                    <td style={iconCell}>
                      <div style={detailIconCircle}>
                        <Text style={detailIcon}>🕐</Text>
                      </div>
                    </td>
                    <td style={detailContent}>
                      <Text style={detailLabel}>Duración total</Text>
                      <Text style={detailValue}>{duration}</Text>
                    </td>
                  </tr>
                </table>
              </Section>
            </Section>

            {/* Resumen de Pago */}
            <Section style={paymentSection}>
              <Heading as="h3" style={paymentHeading}>
                Resumen de Pago
              </Heading>

              <table style={paymentTable}>
                <tr>
                  <td style={paymentRow}>
                    <Text style={paymentLabel}>{daysCount} días × {pricePerDay}/día</Text>
                  </td>
                  <td style={paymentRowRight}>
                    <Text style={paymentValue}>{totalPrice}</Text>
                  </td>
                </tr>
              </table>

              <Hr style={paymentDivider} />

              <table style={paymentTable}>
                <tr>
                  <td style={paymentRow}>
                    <Text style={totalLabel}>Total pagado</Text>
                  </td>
                  <td style={paymentRowRight}>
                    <Text style={totalValue}>{totalPrice}</Text>
                  </td>
                </tr>
              </table>

            </Section>

            {/* Botón CTA */}
            <Section style={buttonContainer}>
              <Button style={button} href="">
                Gestionar Reserva
              </Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "0",
};

const iconSection = {
  textAlign: "center" as const,
  padding: "40px 20px 20px",
};

const checkCircle = {
  backgroundColor: "#10B981",
  borderRadius: "50%",
  width: "80px",
  height: "80px",
  margin: "0 auto",
  textAlign: "center" as const,
  lineHeight: "80px",
};

const checkmark = {
  fontSize: "48px",
  color: "#ffffff",
  margin: "0",
  lineHeight: "80px",
  fontWeight: "bold",
  display: "inline-block",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#10B981",
  textAlign: "center" as const,
  margin: "16px 0 24px",
};

const divider = {
  borderColor: "#10B981",
  borderWidth: "2px",
  margin: "0 54px 32px",
  maxWidth: "80%",
};

const content = {
  padding: "0 54px 48px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525252",
  margin: "0 0 32px",
};

const detailsBox = {
  backgroundColor: "#EFF6FF",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px",
};

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const detailItem = {
  marginBottom: "30px",
};

const detailTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const iconCell = {
  width: "48px",
  verticalAlign: "top" as const,
  paddingRight: "12px",
};

const detailIconCircle = {
  backgroundColor: "#DBEAFE",
  borderRadius: "8px",
  width: "40px",
  height: "40px",
  textAlign: "center" as const,
  lineHeight: "40px",
};

const detailIcon = {
  fontSize: "20px",
  margin: "0",
  lineHeight: "40px",
  display: "inline-block",
};

const detailContent = {
  verticalAlign: "top" as const,
};

const detailLabel = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0 0 4px",
  display: "block",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 4px",
  display: "block",
};

const dateTable = {
  width: "100%",
  marginTop: "20px",
  marginBottom: "30px",
  borderCollapse: "collapse" as const,
};

const dateCell = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  verticalAlign: "top" as const,
};

const dateLabel = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0 0 8px",
  display: "block",
};

const dateValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 4px",
  display: "block",
};

const dateTime = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "0",
  display: "block",
};

const durationSection = {
  marginTop: "20px",
};

const durationTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};


const paymentSection = {
  backgroundColor: "#ffffff",
  marginBottom: "24px",
};

const paymentHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paymentTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const paymentRow = {
  padding: "12px 0",
};

const paymentRowRight = {
  padding: "12px 0",
  textAlign: "right" as const,
};

const paymentLabel = {
  fontSize: "16px",
  color: "#525252",
  margin: "0",
};

const paymentValue = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0",
};

const paymentDivider = {
  borderColor: "#E5E7EB",
  borderWidth: "1px",
  margin: "8px 0",
};

const totalLabel = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const totalValue = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3B82F6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};
