use std::process::Command;

fn main() {
    // get commit hash
    let output = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .unwrap();
    let git_hash = String::from_utf8(output.stdout).unwrap();
    // Add commit hash to env[GIT_HASH]
    println!("cargo:rustc-env=GIT_COMMIT={}", git_hash);
}
