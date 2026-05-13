import java.sql.*;

public class CheckDB {
    public static void main(String[] args) {
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/linkedwork", "root", "")) {
            System.out.println("Solicitudes:");
            ResultSet rs = conn.createStatement().executeQuery("SELECT IdSolicitud, Titulo, Estado FROM solicitud");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("IdSolicitud") + " | Titulo: " + rs.getString("Titulo") + " | Estado: " + rs.getString("Estado"));
            }
            
            System.out.println("\nOfertas:");
            rs = conn.createStatement().executeQuery("SELECT IdOferta, IdSolicitud, Estado FROM oferta");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("IdOferta") + " | Solicitud: " + rs.getInt("IdSolicitud") + " | Estado: " + rs.getString("Estado"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
