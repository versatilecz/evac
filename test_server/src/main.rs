use std::{
    fs::File,
    net::{IpAddr, SocketAddrV4, ToSocketAddrs},
    thread::sleep,
};

#[derive(serde::Serialize, serde::Deserialize)]
struct Config {
    pub scanners: Vec<IpAddr>,
    pub devices: Vec<Vec<u8>>,
    pub services: Vec<Vec<u8>>,
    pub alarm: bool,
}

pub fn main() -> anyhow::Result<()> {
    let file = std::fs::File::open("test.json").unwrap();

    let mut config: Config = serde_json::from_reader(file).unwrap();

    /*= Config {
        scanners: vec!["192.168.1.186".parse()?],
        devices: vec![vec![20, 215, 115, 182, 198, 124]],
        services: vec![vec![0xfc, 0xd2]],
        alarm: false,
    };
    */
    let socket = std::net::UdpSocket::bind("0.0.0.0:34254")?;
    socket.set_broadcast(true)?;
    socket.set_nonblocking(false)?;
    socket.set_read_timeout(Some(std::time::Duration::from_secs(10)))?;

    let hello_msg = shared::messages::scanner::ScannerMessage::Hello;
    let hello_data = rmp_serde::to_vec(&hello_msg)?;

    println!("Send hello packet");
    socket
        .send_to(
            &hello_data,
            SocketAddrV4::new("192.168.1.255".parse()?, 34254),
        )
        .unwrap();

    let mut buffer = [0u8; 1024];
    let timer = std::time::Duration::from_secs(3);
    let mut alarm = std::time::Instant::now() + timer;
    loop {
        if let Ok((len, client)) = socket.recv_from(&mut buffer) {
            if let Ok(msg) =
                rmp_serde::from_slice::<shared::messages::scanner::ScannerMessage>(&buffer[..len])
            {
                match msg {
                    shared::messages::scanner::ScannerMessage::Hello => {
                        // No action
                    }
                    shared::messages::scanner::ScannerMessage::Register => {
                        if config
                            .scanners
                            .iter()
                            .find(|&ip| ip.eq(&client.ip()))
                            .is_some()
                        {
                            let msg = shared::messages::scanner::ScannerMessage::Set(
                                shared::messages::scanner::State {
                                    alarm: config.alarm,
                                    scanning: true,
                                    services: config.services.clone(),
                                },
                            );
                            let data = rmp_serde::to_vec(&msg)?;
                            socket.send_to(&data, client)?;
                        } else {
                            print!("Unregistered device: {}", client.ip());
                        }
                    }
                    shared::messages::scanner::ScannerMessage::ScanResult(result) => {
                        if config
                            .scanners
                            .iter()
                            .find(|&ip| ip.eq(&client.ip()))
                            .is_some()
                            && config
                                .devices
                                .iter()
                                .find(|&mac1| mac1.eq(&result.mac))
                                .is_some()
                        {
                            println!(
                                "Report device: {}[{:?}] rssi: {}",
                                result.name, result.mac, result.rssi
                            );

                            let shelly = vec![210, 252];
                            if let Some((_, data)) =
                                result.services.iter().find(|(uuid, _)| uuid.eq(&shelly))
                            {
                                if data.get(6).unwrap_or(&0).gt(&0) {
                                    config.alarm = !config.alarm;
                                }

                                println!("Battery: {:?} button: {:?}", data.get(4), data.get(6));
                            }
                        }
                    }
                    _ => {
                        print!("{:?}", msg);
                        unimplemented!("Message is unimplemented");
                    }
                }
            }
        }
        if !alarm.elapsed().is_zero() {
            println!("Send hello packet");
            alarm = std::time::Instant::now() + timer;
            socket
                .send_to(
                    &hello_data,
                    SocketAddrV4::new("192.168.1.255".parse()?, 34254),
                )
                .unwrap();
        }
    }

    Ok(())
}
