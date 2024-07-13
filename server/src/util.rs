use anyhow::Context;
use chrono::{DateTime, Utc};

pub fn now() -> DateTime<Utc> {
    chrono::offset::Utc::now()
}

pub fn json_load<A>(path: &str) -> anyhow::Result<A>
where
    A: serde::de::DeserializeOwned,
{
    let file = std::fs::File::open(path)?;
    let json: serde_json::Value = serde_json::from_reader(file)?;
    match serde_json::from_value::<A>(json) {
        Ok(value) => Ok(value),
        Err(err) => {
            tracing::error!("{}", err);
            Err(anyhow::anyhow!("Cannot validate object"))
        }
    }
}

pub fn json_save<A>(path: &str, value: &A) -> anyhow::Result<()>
where
    A: serde::ser::Serialize,
{
    let dir = std::path::Path::new(path)
        .parent()
        .context("Cannot get dir name")?;

    std::fs::create_dir_all(dir)?;
    let file = std::fs::File::create(path)?;
    let json = serde_json::to_value(value)?;
    Ok(serde_json::to_writer_pretty(file, &json)?)
}
