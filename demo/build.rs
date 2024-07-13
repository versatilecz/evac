fn main() {
    embuild::espidf::sysenv::relay();
    embuild::espidf::sysenv::output();

    /*
    println!("cargo::rustc-cfg=esp_idf_eth_spi_ethernet_dm9051");
    println!("cargo::rustc-cfg=esp_idf_comp_esp_eth_enabled");
    println!("cargo::rustc-cfg=esp_idf_comp_esp_event_enabled");
    println!("cargo::rustc-cfg=esp_idf_eth_use_esp32_emac");
    */
}
