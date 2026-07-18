import { useEffect, useState } from "react"
import { ImagePlus, Save, Trash2, Upload } from "lucide-react"

import { PROFILE_STORAGE_KEY } from "@/constants/storageKeys"
import { workshopProfile } from "@/data/mock/workshopProfile"
import { getAuth } from "@/services/authService"
import { getScopedStorageKey } from "@/services/testSessionService"

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-[#52443a]">{label}</span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="mt-2 h-11 w-full rounded-[13px] border border-[#ead8ca] bg-white px-3 text-[14px] text-[#231a11] outline-none focus:border-[#854f19]"
    />
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="mt-2 min-h-28 w-full rounded-[13px] border border-[#ead8ca] bg-white p-3 text-[14px] text-[#231a11] outline-none focus:border-[#854f19]"
    />
  )
}

function ImageUploadBox({ label, image, onChange }) {
  const handleChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const imageData = await readImageFile(file)
    onChange(imageData)
    event.target.value = ""
  }

  return (
    <div className="rounded-[16px] border border-[#ead8ca] bg-[#fffdf9] p-4">
      <p className="text-[13px] font-bold text-[#52443a]">{label}</p>
      <div className="mt-3 grid min-h-44 place-items-center overflow-hidden rounded-[14px] border border-dashed border-[#d8c5b6] bg-white">
        {image ? (
          <img src={image} alt={label} className="h-full max-h-64 w-full object-cover" />
        ) : (
          <div className="text-center text-[#8a796b]">
            <ImagePlus className="mx-auto size-9" />
            <p className="mt-2 text-[14px]">Chưa có ảnh</p>
          </div>
        )}
      </div>
      <label className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white">
        <Upload size={17} />
        Chọn ảnh
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </label>
    </div>
  )
}

function ProfilePage() {
  const [profile, setProfile] = useState(workshopProfile)
  const [savedMessage, setSavedMessage] = useState("")
  const storageKey = getScopedStorageKey(PROFILE_STORAGE_KEY, getAuth())

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(storageKey)
      if (savedProfile) {
        setProfile({ ...workshopProfile, ...JSON.parse(savedProfile) })
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
    setSavedMessage("")
  }

  const addGalleryImages = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const images = await Promise.all(files.map((file) => readImageFile(file)))
    setProfile((current) => ({
      ...current,
      gallery: [...(current.gallery || []), ...images],
    }))
    setSavedMessage("")
    event.target.value = ""
  }

  const removeGalleryImage = (indexToRemove) => {
    setProfile((current) => ({
      ...current,
      gallery: current.gallery.filter((_, index) => index !== indexToRemove),
    }))
    setSavedMessage("")
  }

  const saveProfile = () => {
    localStorage.setItem(storageKey, JSON.stringify(profile))
    setSavedMessage("Đã lưu hồ sơ xưởng")
  }

  const productTypes = profile.productTypes
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  const materials = profile.materials
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  const policies = profile.policies
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <section className="space-y-5">
      <div className="rounded-[18px] border border-[#ead8ca] bg-white p-6 text-left shadow-[0_18px_48px_rgba(82,68,58,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#854f19]">Hồ sơ xưởng</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-[30px] font-bold leading-tight text-[#231a11]">{profile.name}</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#52443a]">{profile.intro}</p>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#854f19] px-4 font-bold text-white"
          >
            <Save size={18} />
            Lưu hồ sơ
          </button>
        </div>
        {savedMessage && <p className="mt-4 rounded-[12px] bg-[#fff1e8] px-4 py-3 text-[14px] font-bold text-[#854f19]">{savedMessage}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-5">
          <ImageUploadBox label="Logo xưởng" image={profile.logo} onChange={(image) => updateField("logo", image)} />
          <ImageUploadBox label="Ảnh đại diện xưởng" image={profile.coverImage} onChange={(image) => updateField("coverImage", image)} />
        </div>

        <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
          <h3 className="text-[18px] font-bold text-[#231a11]">Thông tin cơ bản</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Tên xưởng">
              <TextInput value={profile.name} onChange={(event) => updateField("name", event.target.value)} />
            </Field>
            <Field label="Số điện thoại">
              <TextInput value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </Field>
            <Field label="Email">
              <TextInput value={profile.email} onChange={(event) => updateField("email", event.target.value)} />
            </Field>
            <Field label="Địa chỉ">
              <TextInput value={profile.address} onChange={(event) => updateField("address", event.target.value)} />
            </Field>
            <Field label="Khu vực phục vụ">
              <TextInput value={profile.serviceArea} onChange={(event) => updateField("serviceArea", event.target.value)} />
            </Field>
            <Field label="Năm thành lập">
              <TextInput value={profile.foundedYear} onChange={(event) => updateField("foundedYear", event.target.value)} />
            </Field>
            <Field label="Số năm kinh nghiệm">
              <TextInput value={profile.experience} onChange={(event) => updateField("experience", event.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Giới thiệu ngắn">
                <TextArea value={profile.intro} onChange={(event) => updateField("intro", event.target.value)} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
          <h3 className="text-[18px] font-bold text-[#231a11]">Năng lực xưởng</h3>
          <div className="mt-5 space-y-4">
            <Field label="Danh mục chuyên môn, cách nhau bằng dấu phẩy">
              <TextArea value={profile.productTypes} onChange={(event) => updateField("productTypes", event.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {productTypes.map((item) => (
                <span key={item} className="rounded-full bg-[#fff1e8] px-3 py-1 text-[13px] font-bold text-[#854f19]">{item}</span>
              ))}
            </div>
            <Field label="Vật liệu hỗ trợ, cách nhau bằng dấu phẩy">
              <TextArea value={profile.materials} onChange={(event) => updateField("materials", event.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {materials.map((item) => (
                <span key={item} className="rounded-full border border-[#ead8ca] px-3 py-1 text-[13px] text-[#52443a]">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
          <h3 className="text-[18px] font-bold text-[#231a11]">Chính sách xưởng</h3>
          <div className="mt-5">
            <Field label="Mỗi dòng là một chính sách">
              <TextArea value={profile.policies} onChange={(event) => updateField("policies", event.target.value)} />
            </Field>
            <div className="mt-4 grid gap-3">
              {policies.map((item) => (
                <div key={item} className="rounded-[14px] border border-[#ead8ca] bg-[#fffdf9] p-4 text-[14px] text-[#52443a]">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#ead8ca] bg-white p-5 text-left shadow-[0_14px_36px_rgba(82,68,58,0.06)]">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="text-[18px] font-bold text-[#231a11]">Ảnh về xưởng và công trình</h3>
            <p className="mt-1 text-[14px] text-[#52443a]">Xưởng có thể tải ảnh máy móc, khu gia công, sản phẩm đã hoàn thiện hoặc công trình đã lắp đặt.</p>
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[13px] bg-[#854f19] px-4 text-[14px] font-bold text-white">
            <Upload size={17} />
            Thêm ảnh
            <input type="file" accept="image/*" multiple className="hidden" onChange={addGalleryImages} />
          </label>
        </div>

        {profile.gallery.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {profile.gallery.map((image, index) => (
              <div key={image} className="group relative overflow-hidden rounded-[14px] border border-[#ead8ca] bg-[#fffdf9]">
                <img src={image} alt={`Ảnh xưởng ${index + 1}`} className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white text-[#854f19] shadow-md"
                  aria-label="Xóa ảnh"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid min-h-48 place-items-center rounded-[14px] border border-dashed border-[#d8c5b6] bg-[#fffdf9] text-center text-[#8a796b]">
            <div>
              <ImagePlus className="mx-auto size-10" />
              <p className="mt-2 text-[14px]">Chưa có ảnh xưởng hoặc công trình</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProfilePage
